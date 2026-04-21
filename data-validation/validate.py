import pandas as pd
import sys
import os
base_dir = os.path.dirname(os.path.abspath(__file__))
input_df = pd.read_csv(os.path.join(base_dir, 'input.csv'))
output_df = pd.read_csv(os.path.join(base_dir, 'output.csv'))
all_passed = True
print(f'Input Rows: {len(input_df)}')
print(f'Output Rows: {len(output_df)}')
input_cols = [col.strip() for col in input_df.columns]
output_cols = [col.strip() for col in output_df.columns]
if set(input_cols) == set(output_cols):
    print('Passed: Output schema matches input schema')
else:
    print('Failed: Output schema does not match input schema')
    print(f'Columns in Input but not in output: {set(input_cols) - set(output_cols)}')
    print(f'Columns in Output but not in input: {set(output_cols) - set(input_cols)}')
    all_passed = False
    
if len(output_df) <= len(input_df):
    print('Passed : No rows were invented')
else:
    print('Failed: Rows were invented')
    all_passed = False

if output_df.duplicated().sum() == 0:
    print('Passed: No duplicate entries in output')
else:
    print('Failed: Duplicate entries in output')
    all_passed = False
    
if (len(output_df.dropna(how='all')) == len(output_df)):
    print('Passed: Empty rows removed')
else:
    print('Failed: Empty rows left')
    all_passed = False


    
email_col_name = next((col for col in output_df.columns if 'email' in col.lower()), None)
if email_col_name is None:
    print('Warning: No email column found, skipping email validation')
else:
    email_col = output_df[email_col_name].dropna()
    invalid = len(email_col[~email_col.str.contains(r'^[\w.+-]+@[\w-]+\.[a-z]{2,}$', na=False)])

    if invalid == 0:
        print('Passed: All emails are valid format')
    else:
        print(f'Failed: {invalid} invalid email(s) found in output')
        all_passed = False
    
print('---')
print('All checks passed' if all_passed else 'Some checks FAILED')
sys.exit(0 if all_passed else 1)

