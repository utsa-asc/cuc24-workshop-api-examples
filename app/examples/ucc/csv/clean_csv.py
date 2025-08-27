#!/usr/bin/env python3

import sys
import os

def char_to_html_entity(char):
    return f'&#{ord(char)};'

def clean_text(text):
    if not text:
        return text
    
    result = ''
    for char in text:
        # Keep ASCII letters, numbers, basic punctuation, spaces, and line breaks
        if ord(char) <= 127 and (char.isalnum() or char in ' .,!?:;()[]{}"\'-/_@#$%^&*+=<>|\\`~\n\r\t'):
            result += char
        # Skip BOM character (Byte Order Mark) - don't convert it
        elif ord(char) == 65279:  # U+FEFF BOM
            continue
        # Convert non-breaking spaces to HTML entity
        elif ord(char) == 160:  # U+00A0 non-breaking space
            result += '&#160;'
        # Specifically handle U+2019 right single quotation mark
        elif ord(char) == 8217:  # U+2019 right single quotation mark
            result += '&#8217;'
        else:
            # Convert non-standard characters to HTML entities
            result += char_to_html_entity(char)
    
    return result

def main():
    # Get input file from command line argument or use default
    input_file = sys.argv[1] if len(sys.argv) > 1 else 'ucc-events-test.csv'
    output_file = f"{input_file.rsplit('.', 1)[0]}-cleaned.csv"
    
    print(f"Cleaning CSV file: {input_file}")
    print(f"Output file: {output_file}")
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' not found!")
        sys.exit(1)
    
    try:
        # Read input file
        with open(input_file, 'r', encoding='utf-8-sig') as infile:
            content = infile.read()
        
        # Clean the content
        cleaned_content = clean_text(content)
        
        # Write output file
        with open(output_file, 'w', encoding='utf-8') as outfile:
            outfile.write(cleaned_content)
        
        print('Successfully cleaned CSV file!')
        print(f"Original file: {input_file}")
        print(f"Cleaned file: {output_file}")
        print("")
        print(f"To use the cleaned file, update your JavaScript to load '{output_file}' instead of '{input_file}'")
        
    except Exception as e:
        print(f"Error processing file: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()