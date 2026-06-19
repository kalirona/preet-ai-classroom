const fs = require('fs');
const path = require('path');

// The script is at: F:\...\skool app\skool app\scripts\fix-build.cjs
// The source file is at: F:\...\skool app\classroom_view_extract.tsx  (parent dir)
const srcPath = path.resolve(__dirname, '..', '..', 'classroom_view_extract.tsx');
// The target is at: F:\...\skool app\src\components\ClassroomView.tsx (git root = parent)
const targetPath = path.resolve(__dirname, '..', '..', 'src', 'components', 'ClassroomView.tsx');

console.log(`Source: ${srcPath}`);
console.log(`Target: ${targetPath}`);

if (!fs.existsSync(srcPath)) {
    console.error('Source file not found!');
    process.exit(1);
}

let content = fs.readFileSync(srcPath, 'utf8');
const lines = content.split('\n');
console.log(`File has ${lines.length} lines`);

// The fix: Remove premature ternary close at line 3349 and extra </div> at line 3473
console.log(`\nLines around fix:`);
for (let i = 3346; i <= 3353; i++) console.log(`${i+1}: '${lines[i]}'`);
console.log('...');
for (let i = 3470; i <= 3476; i++) console.log(`${i+1}: '${lines[i]}'`);

const lineToRemove1 = 3348; // 0-indexed - premature `)}`
const lineToRemove2 = 3472; // 0-indexed - extra `</div>`

console.log(`\nRemoving line ${lineToRemove1 + 1}: '${lines[lineToRemove1]}'`);
console.log(`Removing line ${lineToRemove2 + 1}: '${lines[lineToRemove2]}'`);

const newLines = [
    ...lines.slice(0, lineToRemove1),
    ...lines.slice(lineToRemove1 + 1, lineToRemove2),
    ...lines.slice(lineToRemove2 + 1),
];

console.log(`\nOriginal lines: ${lines.length}`);
console.log(`New lines: ${newLines.length}`);
console.log(`Removed ${lines.length - newLines.length} lines`);

fs.writeFileSync(targetPath, newLines.join('\n') + '\n', 'utf8');
console.log('Done!');