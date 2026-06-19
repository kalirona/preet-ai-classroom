const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', '..', 'src', 'components', 'ClassroomView.tsx');
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');
const totalLines = lines.length;

console.log(`Total lines: ${totalLines}`);
console.log(`\n=== Error 1: Line 4337 ===`);
for (let i = 4325; i <= 4350; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}

console.log(`\n=== Error 2: Line 5684 ===`);
for (let i = 5675; i < totalLines; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}

// The issue at line 4337 is a `)}` that prematurely closes an expression
// The certificate modal (line 4339+) is then OUTSIDE the return statement

// The issue is structural. Let me check what wraps around these sections.
// The key question: where does the actual component return() begin and end?

// Find the return statement
let returnIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('return (') && lines[i].includes('<>') && returnIdx < 0) {
        returnIdx = i;
    }
    // Also check for return (
    if (lines[i].trim().startsWith('return') && lines[i].trim().endsWith('(') && !lines[i].includes('function') && !lines[i].includes('=>')) {
        returnIdx = i;
    }
}

// Find the matching closing parentheses for return (
console.log(`\n=== Checking return statement ===`);
for (let i = 4330; i < Math.min(totalLines, 4345); i++) {
    console.log(`${i+1}: ${lines[i]}`);
}

// The structure at 4337 is `)}` - this closes a } expression wrapper
// But the certificate modal at 4340 starts with `{certificateModalOpen && (`
// So the certificate modal is INSIDE the return's JSX but the `)}` prematurely closes something

// Let me check: what expression does 4337 close?
// 4335: `          </div>`  - closes notes+resources div
// 4336: `        </div>`    - closes player right panel 
// 4337: `      )}`          - THIS IS THE BUG - prematurely closes the expression

// The expression should close AFTER the certificate modal, not before it
// So we need to remove the `)}` at 4337 and add it after the certificate modal

// But looking at 4339-5681: `{certificateModalOpen && selectedCourse && (...)
// This is ITS OWN expression, it doesn't need to be wrapped by another
// The `)}` at 4337 is likely closing something like `{activeLesson ? (`
// But `activeLesson` expression ends at line 4335 or so

// Let me check the broader structure
console.log('\n\n=== Player section structure ===');
for (let i = 3470; i <= 3490; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}

console.log('\nLines 3495-3505:');
for (let i = 3495; i <= 3505; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}

// Find where the `{selectedCourse ? (` ternary starts
console.log('\n=== Finding selectedCourse ternary ===');
for (let i = 3400; i < 3500; i++) {
    if (lines[i].includes('selectedCourse ?') || lines[i].includes('selectedCourse ? (')) {
        console.log(`${i+1}: ${lines[i]}`);
    }
}

// At line 3057: `          ) : (`
// At line 3061: `<div id="student-classroom-dashboard">`  
// This is an inner ternary: `{userRole === "creator" ? (creator view) : (student view)}`

// The student view (3061+) contains:
// - Continue learning section
// - My courses section 
// - Dashboard grid
// - And then at 3475: `<div className="space-y-4">` (course player when selectedCourse is set)

// At line 3475: `        <div className="space-y-4">`
// This is the course player section shown when selectedCourse is set
// It ends at line 4336 with `</div>` then line 4337 `)}`

// Then at 4340: `{certificateModalOpen && selectedCourse && (`
// Certificate modal is OUTSIDE the selectedCourse ternary

// And then at 5683: `</div>` closes the `id="student-classroom-dashboard"` div
// And line 5684: `);` closes the return

console.log('\n\n=== Understanding the structure ===');
console.log('Line 3057: ) : (    - closes creator ternary and starts else (student view)');
console.log('Line 3061: <div id="student-classroom-dashboard">');
console.log('Line 3475: <div className="space-y-4">    - course player when selectedCourse is set');
console.log('Line 4337: )}         - prematurely closes selectedCourse expression (BUG!)');
console.log('Line 4340: {certificateModalOpen && selectedCourse && (  - OUTSIDE expression (BUG!)');
console.log('Line 5681: )}         - closes certificate modal');
console.log('Line 5683: </div>    - closes student-classroom-dashboard');
console.log('Line 5684: );        - return statement');

// The fix: 
// The `)}` at line 4337 should be AFTER the certificate modal
// So we need to:
// 1. Remove line 4337 `)}` 
// 2. Move the `)}` to after line 5681 (after certificate modal closes)

console.log('\n=== Applying fix ===');
const lineToRemove = 4336; // 0-indexed = line 4337

console.log(`Removing line ${lineToRemove + 1}: '${lines[lineToRemove].trim()}'`);

// Remove the premature `)}` at line 4337
const newLines = [
    ...lines.slice(0, lineToRemove),
    ...lines.slice(lineToRemove + 1),
];

// Now find where the certificate modal ends and add `)}` there
// The modal closes at original line 5681 with `)` then line 5682 `}`
// Actually wait - looking at the original:
// 5680: `        </div>`
// 5681: `      )}`
// 5682: `` (empty)
// 5683: `     </div>`  <- closes the student-classroom-dashboard
// 5684: `   );`        <- return statement
// 5685: ` }`           <- component close

// After removing line 4337, the `)}` needs to be added before the component closes
// But lines shifted by 1, so the certificate modal close is now at line 5680

// Find the certificate modal close `)}`
let certModalClose = -1;
for (let i = newLines.length - 20; i < newLines.length; i++) {
    if (newLines[i].trim() === ')}' && certModalClose < 0) {
        certModalClose = i;
    }
}

console.log(`Certificate modal `)}` at line: ${certModalClose + 1}`);

// After the certificate modal `)}`, we need to add another `)}` 
// to close the selectedCourse expression

// But first, let me check if the )} we removed was needed or not
// Actually the real fix should be:
// The selectedCourse ? (...) expression content ends with `</div>` at line 4335
// Then the )} at 4337 was meant to close that expression
// But the certificate MODAL is ALSO inside the selectedCourse expression
// SO the )} at 4337 was premature - remove it, and add )} after the modal

// Insert a `)}` after the certificate modal close
const insertAfter = certModalClose; // After existing `)}`
const finalLines = [
    ...newLines.slice(0, insertAfter + 1),
    '          )}',  // Properly close the selectedCourse expression 
    '',              // blank line
    ...newLines.slice(insertAfter + 1),
];

// Also check line 5684 - the `);` is the return statement, that's correct
// The error "Expected '}' but found ';'" at line 5684 is because the )} at 4337
// created an orphaned closing. After our fix, this should resolve.

fs.writeFileSync(filePath, finalLines.join('\n'), 'utf8');
console.log(`\nDone!`);
console.log(`Original lines: ${totalLines}`);
console.log(`New lines: ${finalLines.length}`);