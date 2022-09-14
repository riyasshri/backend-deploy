import os
import sys

statement = sys.argv[1]
branch = sys.argv[2]
try:
    os.system('git add .')
    os.system(f'git commit -m "{statement}"')
    os.system(f'git pull origin {branch}')
    os.system(f'git push origin {branch}')
except:
    print("Couldnt execute command")
