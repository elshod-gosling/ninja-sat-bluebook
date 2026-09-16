# extraction script
import asyncio
import os
import re
import json
import pymupdf
import winocr
from PIL import Image

PDF_MAP = [
    ('Ninja english practice 1 (2).pdf', 1),
    ('Ninja english practice 2.pdf', 2),
    ('Ninja english practice 3.pdf', 3),
    ('Ninja english practice 4.pdf', 4),
    ('Ninja english practice 5.pdf', 5),
]

os.makedirs('data', exist_ok=True)
os.makedirs('assets/questions', exist_ok=True)

async def process_all():
    all_tests = {}

    for pdf_filename, test_num in PDF_MAP:
        if not os.path.exists(pdf_filename):
            print(f'Warning: {pdf_filename} not found, skipping.')
            continue
        
        print(f'Processing Test {test_num} ({pdf_filename})...')
        doc = pymupdf.open(pdf_filename)
        test_key = f'test_{test_num}'
        all_tests[test_key] = {
            'id': test_key,
            'title': f'Practice Test {test_num}',
            'subtitle': 'Digital SAT Reading and Writing',
            'test_number': test_num,
            'total_questions': len(doc),
            'modules': {
                'module_1': {
                    'id': f'test_{test_num}_m1',
                    'title': 'Section 1, Module 1: Reading and Writing',
                    'time_limit_minutes': 32,
                    'questions': []
                },
                'module_2': {
                    'id': f'test_{test_num}_m2',
                    'title': 'Section 1, Module 2: Reading and Writing',
                    'time_limit_minutes': 32,
                    'questions': []
                }
            }
        }

        mat = pymupdf.Matrix(1920/792, 1077/612)

        for page_idx in range(len(doc)):
            mod_num = 1 if page_idx < 27 else 2
            mod_key = f'module_{mod_num}'
            q_num = (page_idx % 27) + 1
            
            p = doc[page_idx]
            pix = p.get_pixmap(matrix=mat)
            im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
            
            # Crop middle content area (y: 180 to 735)
            # Add small margin for clean visuals
            crop_im = im.crop((50, 180, 1870, 735))
            
            img_rel_path = f'assets/questions/t{test_num}_m{mod_num}_q{q_num}.webp'
            crop_im.save(img_rel_path, 'WEBP', quality=90)
            
            # OCR
            res = await winocr.recognize_pil(im, 'en')
            
            left_lines = []
            right_lines = []
            
            for l in res.lines:
                w = l.words[0]
                x, y = w.bounding_rect.x, w.bounding_rect.y
                
                # Ignore top bar and bottom bar
                if y < 185 or y > 735:
                    continue
                
                txt = l.text.strip()
                if not txt:
                    continue
                
                if x < 950:
                    left_lines.append((y, txt))
                else:
                    if txt == 'Mark for Review' or re.fullmatch(r'\d+', txt):
                        continue
                    right_lines.append((y, txt))
            
            # Left pane: sort by y to maintain order
            left_lines.sort(key=lambda item: item[0])
            passage_lines = [item[1] for item in left_lines]
            passage = '\n'.join(passage_lines)
            
            # Right pane: prompt + choices
            right_lines.sort(key=lambda item: item[0])
            prompt_lines = []
            choices = {'A': '', 'B': '', 'C': '', 'D': ''}
            curr_choice = None
            
            for y, txt in right_lines:
                choice_match = re.match(r'^([A-D])\s*[:\.]\s*(.*)$', txt)
                if choice_match:
                    curr_choice = choice_match.group(1)
                    choices[curr_choice] = choice_match.group(2).strip()
                elif curr_choice is not None:
                    # Append continuation
                    choices[curr_choice] += ' ' + txt
                else:
                    prompt_lines.append(txt)
            
            prompt = ' '.join(prompt_lines).strip()
            
            # Clean up choices
            for k in choices:
                choices[k] = re.sub(r'\s*\.?\d*\s*$', '', choices[k]).strip()
            
            q_data = {
                'id': f't{test_num}_m{mod_num}_q{q_num}',
                'test_number': test_num,
                'module_number': mod_num,
                'question_number': q_num,
                'passage': passage,
                'prompt': prompt,
                'choices': choices,
                'image': img_rel_path,
                'answer': None
            }
            
            all_tests[test_key]['modules'][mod_key]['questions'].append(q_data)
        
        print(f'Test {test_num} extracted successfully: 54 questions.')

    # Save to JSON
    with open('data/practice_tests.json', 'w', encoding='utf-8') as f:
        json.dump(all_tests, f, indent=2, ensure_ascii=False)
    
    # Save to JS for CORS-free local execution
    with open('data/tests_data.js', 'w', encoding='utf-8') as f:
        f.write('window.NINJA_TESTS = ' + json.dumps(all_tests, indent=2, ensure_ascii=False) + ';\n')
    
    print('All tests saved to data/practice_tests.json and data/tests_data.js!')

asyncio.run(process_all())
