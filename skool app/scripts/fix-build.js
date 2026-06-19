const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(__dirname, '..', 'ClassroomView.tsx.tmp');
const outPath = path.resolve(__dirname, '..', 'src', 'components', 'ClassroomView.tsx');

let content = fs.readFileSync(srcPath, 'utf8');
const lines = content.split('\n');

console.log(`File has ${lines.length} lines`);

// The bug: showCreateCourseModal is outside the ternary's true branch
// Lines 3351-3472 (modal block) appears AFTER the true branch closes at line 3349
// It needs to be INSIDE the true branch

// Find the key markers
let trueBranchCloseIdx = -1;
let modalStartIdx = -1;
let modalEndIdx = -1;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Line 3349: `          )}`
    if (line.trimEnd() === '          )' && i > 3000 && trueBranchCloseIdx < 0) {
        // Check the next line for the }, or this is the } line
        if (i > 0) trueBranchCloseIdx = i;
    }
    // Actually, let me just find it differently
    if (line.includes('CREATE MANUAL COURSE DIALOG INLINE MODAL')) {
        modalStartIdx = i;
    }
}

// Let me scan more carefully
console.log('Scanning lines 3340-3480...');
for (let i = 3335; i < Math.min(lines.length, 3485); i++) {
    console.log(`${i+1}: ${lines[i]}`);
}

// The fix:
// The structure should be:
// Line 3348: `              </div>`   (closes bottom section grid)
// Line 3351-3472: modal block        (NEEDS TO BE INSERTED HERE)
// Line 3349: `          )}`           (closes ternary true branch)
// 
// But currently lines 3351-3472 are AFTER line 3349

// So I need to:
// 1. Remove lines 3351-3472 from their current position (after line 3349)
// 2. Insert them between lines 3348 and 3349

// Let me find the exact line numbers
// Find line: `              </div>` that's right before `          )}`
let insertAfterLine = -1;
let closeTernaryLine = -1;

for (let i = 3330; i < Math.min(lines.length, 3360); i++) {
    if (lines[i].trimEnd() === '              </div>' && insertAfterLine < 0 && i > 3320) {
        insertAfterLine = i; // The last </div> before the ternary close
    }
    if (lines[i].trimEnd() === '          )') {
        // Check next line for `}`
        if (i + 1 < lines.length && lines[i + 1].trimEnd() === '') {
            // Might be an empty line, check for }
        }
        if (closeTernaryLine < 0 && i > insertAfterLine) {
            closeTernaryLine = i;
        }
    }
    if (lines[i].trimEnd() === '          )}' && closeTernaryLine < 0) {
        closeTernaryLine = i;
    }
}

// Let me find more precisely
// Looking at the output: line 3348 has `              </div>` and line 3349 has `          )}`
// But it could be that line 3349 is `          )}` all on one line
console.log(`\nCheck lines 3348-3349:`);
console.log(`3348: '${lines[3347]}'`);
console.log(`3349: '${lines[3348]}'`);
console.log(`3350: '${lines[3349]}'`);
console.log(`3351: '${lines[3350]}'`);
console.log(`3352: '${lines[3351]}'`);  // 0-indexed

// Modal start is at line 3351 (0-indexed: 3350)
// The true branch close )} is at line 3349 (0-indexed: 3348)
// The last </div> before that is line 3348 (0-indexed: 3347)

const modalStartIdx_actual = modalStartIdx; // 3350 (0-indexed)
const beforeClose_Line = 3347; // 0-indexed, line 3348

// Find the modal end - the `)}` that closes {showCreateCourseModal && (
let modalCloseAt = -1;
let depth = 1;
let inModal = false;

for (let i = modalStartIdx; i < Math.min(lines.length, modalStartIdx + 130); i++) {
    if (i === modalStartIdx) { inModal = true; continue; }
    if (!inModal) continue;
    
    for (let j = 0; j < lines[i].length; j++) {
        if (lines[i][j] === '(') depth++;
        if (lines[i][j] === ')') {
            depth--;
            if (depth === 0) {
                modalCloseAt = i;
                break;
            }
        }
    }
    if (modalCloseAt > 0) break;
}

console.log(`\nModal starts at line: ${modalStartIdx + 1}`);
console.log(`Modal closes at line: ${modalCloseAt + 1}`);
console.log(`Last closing div before ternary close: line ${beforeClose_Line + 1}`);
console.log(`Ternary close )}: line ${beforeClose_Line + 2}`);

// Extract the modal content (including the comment header)
const modalContent = lines.slice(modalStartIdx, modalCloseAt + 1);

// Build the new file content:
// - Lines before the insertion point (0 to beforeClose_Line)
// - The modal content
// - Lines after the modal removal point (modalCloseAt + 1 to end)

// But we need to skip the old modal position
const newLines = [
    ...lines.slice(0, beforeClose_Line + 1),
    '',  // blank line for spacing
    ...modalContent,
    '',  // blank line for spacing
    ...lines.slice(modalCloseAt + 1)
];

const newContent = newLines.join('\n');
fs.writeFileSync(outPath, newContent, 'utf8');
console.log(`\nWritten ${outPath}`);
console.log(`Lines: ${newLines.length}`);

// Now remove the stray `        </div>` that was after the modal
// AND the ) : ( that's now orphaned
// Let's verify the result

// No wait, let me think again. After moving the modal inside the true branch:
// The lines after modalCloseAt+1 will be:
// - The old position of `        </div>` (line 3473) - this should be removed now
// - The `      ) : (` (line 3474) - this is the else of the ternary, keep it

// Let me handle this differently
const afterModal = lines.slice(modalCloseAt + 1);
console.log('\nContent after modal position:');
afterModal.slice(0, 5).forEach((l, i) => console.log(`${modalCloseAt + i + 2}: '${l}'`));