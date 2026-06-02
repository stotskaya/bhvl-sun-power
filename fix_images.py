import os
import re

directory = 'content/products'

# Matches a line like `  - "/images/products/1.jpg"` or `  - /images/...`
# Ensure it is under the `images:` block.
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.md'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # We need to find the `images:` block and replace the list items.
            # A regex that matches `images:\n` and then any number of `  - "something"\n`
            
            lines = content.split('\n')
            in_images = False
            new_lines = []
            changed = False
            
            for line in lines:
                if line.startswith('images:'):
                    in_images = True
                    new_lines.append(line)
                elif in_images and line.startswith('  -'):
                    # Check if it doesn't already have `item:`
                    if 'item:' not in line:
                        # Replace `  - "..."` with `  - item: "..."`
                        # or `  - ...` with `  - item: ...`
                        # e.g., `  - "/images..."` -> `  - item: "/images..."`
                        parts = line.split('- ', 1)
                        if len(parts) == 2:
                            new_line = parts[0] + '- item: ' + parts[1]
                            new_lines.append(new_line)
                            changed = True
                        else:
                            new_lines.append(line)
                    else:
                        new_lines.append(line)
                elif in_images and not line.strip().startswith('-') and line.strip() != '':
                    # No longer in images block
                    in_images = False
                    new_lines.append(line)
                else:
                    new_lines.append(line)
                    
            if changed:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(new_lines))
                print(f"Updated {filepath}")
