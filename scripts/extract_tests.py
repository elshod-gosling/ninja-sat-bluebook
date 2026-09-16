import os
import json
import pymupdf
from PIL import Image

PDF_MAP = [
    ('Ninja english practice 1 (2).pdf', 1),
    ('Ninja english practice 2.pdf', 2),
    ('Ninja english practice 3.pdf', 3),
    ('Ninja english practice 4.pdf', 4),
    ('Ninja english practice 5.pdf', 5),
]

os.makedirs('assets/questions', exist_ok=True)
os.makedirs('data', exist_ok=True)

all_tests = {}

for pdf_filename, test_num in PDF_MAP:
    if not os.path.exists(pdf_filename):
        print(f"Skipping {pdf_filename} (not found)")
        continue
    
    print(f"Processing Test {test_num} ({pdf_filename})...")
    doc = pymupdf.open(pdf_filename)
    test_key = f"test_{test_num}"
    
    all_tests[test_key] = {
        "id": test_key,
        "title": f"Practice Test {test_num}",
        "subtitle": "Digital SAT Reading and Writing",
        "test_number": test_num,
        "total_questions": len(doc),
        "modules": {
            "module_1": {
                "id": f"test_{test_num}_m1",
                "title": "Section 1, Module 1: Reading and Writing",
                "time_limit_minutes": 32,
                "questions": []
            },
            "module_2": {
                "id": f"test_{test_num}_m2",
                "title": "Section 1, Module 2: Reading and Writing",
                "time_limit_minutes": 32,
                "questions": []
            }
        }
    }

    mat = pymupdf.Matrix(1920/792, 1077/612)

    for page_idx in range(len(doc)):
        mod_num = 1 if page_idx < 27 else 2
        mod_key = f"module_{mod_num}"
        q_num = (page_idx % 27) + 1
        
        p = doc[page_idx]
        pix = p.get_pixmap(matrix=mat)
        im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
        
        # Crop middle content between the top dashed border and bottom dashed border
        # Bounds: x from 100 to 1820, y from 285 to 710
        crop = im.crop((100, 285, 1820, 710))
        
        # Split into left (passage) and right (question + choices)
        # Center divider is at x = 860
        p_im = crop.crop((0, 0, 855, crop.height))
        q_im = crop.crop((865, 0, crop.width, crop.height))
        
        p_path = f"assets/questions/t{test_num}_m{mod_num}_q{q_num}_p.webp"
        q_path = f"assets/questions/t{test_num}_m{mod_num}_q{q_num}_q.webp"
        full_path = f"assets/questions/t{test_num}_m{mod_num}_q{q_num}.webp"
        
        p_im.save(p_path, 'WEBP', quality=95)
        q_im.save(q_path, 'WEBP', quality=95)
        crop.save(full_path, 'WEBP', quality=95)
        
        q_data = {
            "id": f"t{test_num}_m{mod_num}_q{q_num}",
            "test_number": test_num,
            "module_number": mod_num,
            "question_number": q_num,
            "passage_image": p_path,
            "question_image": q_path,
            "full_image": full_path,
            "prompt": f"Question {q_num}",
            "choices": {
                "A": "Option A",
                "B": "Option B",
                "C": "Option C",
                "D": "Option D"
            }
        }
        
        all_tests[test_key]["modules"][mod_key]["questions"].append(q_data)

with open('data/practice_tests.json', 'w', encoding='utf-8') as f:
    json.dump(all_tests, f, indent=2, ensure_ascii=False)

with open('data/tests_data.js', 'w', encoding='utf-8') as f:
    f.write('window.NINJA_TESTS = ' + json.dumps(all_tests, indent=2, ensure_ascii=False) + ';\n')

print("All 270 questions cleanly re-extracted and saved!")
