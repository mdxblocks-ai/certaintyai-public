import re

def parse_jsx():
    with open('src/pages/Dashboard.jsx', 'r', encoding='utf-8') as f:
        text = f.read()

    # Find the start of the return statement in Dashboard
    # It starts around line 2121. Let's find "return (" inside "export default function Dashboard"
    lines = text.splitlines()
    start_idx = 0
    for idx, line in enumerate(lines):
        if 'return (' in line and idx > 2000:
            start_idx = idx
            break
            
    print(f"Starting JSX analysis at line {start_idx + 1}")
    
    tag_stack = []
    
    # We want to scan the file character by character from start_idx
    # but skip JSX comments {/* ... */} and standard JS comments and strings
    i = start_idx
    line_num = start_idx + 1
    char_idx = 0
    
    in_comment = False
    in_jsx_comment = False
    in_string = None # '"' or "'" or "`"
    
    html_tag_pattern = re.compile(r'<(/?[a-zA-Z0-9\._-]+)([^>]*)>')
    
    # Let's do a regex-based tag finder but we only look at tag opening/closing
    # within the return block.
    # To do this safely, let's strip comments and strings first.
    # We replace comments and strings with placeholders.
    
    # Let's do a line-by-line tag scanning but we ignore comments
    for idx in range(start_idx, len(lines)):
        l_num = idx + 1
        line = lines[idx]
        
        # strip JS comments
        # if the line contains a string, we have to be careful, but standard clean up:
        clean = line
        # remove JSX comments
        clean = re.sub(r'\{/\*.*?\*/\}', '', clean)
        # remove single-line comments
        clean = re.sub(r'//.*', '', clean)
        
        # Now find tags: <tag or </tag
        # Be careful of expressions like: activeTab === 'home' && ( ... )
        # or JSX attributes like: className="flex"
        # We can find '<' followed by an identifier or '/' and identifier
        # Let's find all occurrences of '<'
        pos = 0
        while True:
            pos = clean.find('<', pos)
            if pos == -1:
                break
                
            # Check if this is a tag or a comparison operator (like < 10)
            # A tag starts with < followed by a letter, or </ followed by a letter, or <Icons.
            rest = clean[pos+1:]
            if rest.startswith('/') and (rest[1].isalpha() or rest[1] == '_'):
                # Closing tag
                tag_name = re.match(r'/([a-zA-Z0-9\._-]+)', rest).group(1)
                if tag_stack:
                    prev = tag_stack.pop()
                    if prev != tag_name:
                        print(f"Line {l_num}: Mismatch! </{tag_name}> closed but expected </{prev}>. Remaining stack: {tag_stack}")
                        tag_stack.append(prev) # put it back to avoid cascade errors
                else:
                    print(f"Line {l_num}: Extra closing </{tag_name}>. Stack empty!")
                pos += len(tag_name) + 2
            elif rest and (rest[0].isalpha() or rest[0] == '_' or rest.startswith('Icons.')):
                # Opening tag
                tag_name = re.match(r'([a-zA-Z0-9\._-]+)', rest).group(1)
                
                # Check if it is self-closing on the same line
                # e.g., <Icons.Mic />
                # find the closing '>'
                closing_pos = rest.find('>')
                is_self_closing = False
                if closing_pos != -1:
                    tag_body = rest[:closing_pos]
                    if tag_body.strip().endswith('/'):
                        is_self_closing = True
                
                if not is_self_closing:
                    tag_stack.append(tag_name)
                    
                pos += len(tag_name) + 1
            else:
                # Comparison operator or something else
                pos += 1
                
        # print tag stack for settings tab and after
        if l_num >= 4370 and l_num <= 4380:
            print(f"Line {l_num}: tag_stack={tag_stack}")

if __name__ == '__main__':
    parse_jsx()
