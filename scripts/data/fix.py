def fix_addresses(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    fixed_lines = []
    current_address = None
    current_row = None
    
    for line in lines:
        # Split the line into columns
        columns = line.strip().split(';')
        
        # If we have exactly 9 columns and the first column isn't empty
        if len(columns) == 9 and columns[0] != '':
            # If we were building an address, add it to the previous row
            if current_address and current_row:
                current_row[8] = f'"{current_address}"'
                fixed_lines.append(';'.join(current_row))
            
            current_row = columns
            # If the last column starts with a quote but doesn't end with one
            if columns[8].startswith('"') and not columns[8].endswith('"'):
                current_address = columns[8].strip('"')
            else:
                fixed_lines.append(';'.join(columns))
                current_address = None
                current_row = None
        
        # If we have a continuation of an address
        elif current_address is not None:
            # Add this line to the current address
            new_part = line.strip().strip('"')
            if new_part:
                if any(c.isdigit() for c in new_part):
                    current_address += f" - {new_part}"
                else:
                    current_address += f", {new_part}"
    
    # Don't forget to add the last row if we were building an address
    if current_address and current_row:
        current_row[8] = f'"{current_address}"'
        fixed_lines.append(';'.join(current_row))

    # Write the fixed lines to the output file
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        for line in fixed_lines:
            f.write(line + '\n')

# Use the function
fix_addresses('./products.csv', './products_fixed.csv')