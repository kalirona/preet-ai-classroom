const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(__dirname, '..', 'ClassroomView.tsx.tmp');
const outPath = path.resolve(__dirname, '..', 'src', 'components', 'ClassroomView.tsx');

let content = fs.readFileSync(srcPath, 'utf8');
let lines = content.split('\n');

console.log(`File has ${lines.length} lines`);

console.log('Lines 3346-3353:');
for (let i = 3345; i < Math.min(lines.length, 3355); i++) {
    console.log(`${i+1}: '${lines[i]}'`);
}

console.log('\nLines 3470-3480:');
for (let i = 3469; i < Math.min(lines.length, 3482); i++) {
    console.log(`${i+1}: '${lines[i]}'`);
}

// Find exact lines for the fix
// The problem:
// Line 3349 (0-indexed 3348): `          )}`
//   - This CLOSES the ternary true branch
// Lines 3351-3472: showCreateCourseModal block (OUTSIDE ternary)
// Line 3473 (0-indexed 3472): `        </div>` (extra div)
// Line 3474 (0-indexed 3473): `      ) : (` (else branch)

// Fix: 
// 1. Move modal block INSIDE the ternary true branch (before line 3349)
// 2. Close the ternary AFTER the modal
// 3. Remove the extra `        </div>` that was after the modal

// The true branch needs to:
// ... content ...
//              </div>   <- line 3348 (closes grid)
//          </div>       <- needs to be added? no...
//          {showCreateCourseModal && (  <- MODAL STARTS
//            ...
//          )}            <- MODAL ENDS
//          )}            <- ternary close

// Actually wait - let me look at line 3348-3349 more carefully
console.log('\n\n=== DETAILED ANALYSIS ===');

// Find the )} that closes the ternary
let ternaryCloseIdx = -1;
let modalBlockStartIdx = -1;
let modalBlockEndIdx = -1;
let extraDivIdx = -1;
let elseIdx = -1;

for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    
    // Find the )} that's right before the modal
    if (trimmed === ')}' && i > 3000 && ternaryCloseIdx < 0) {
        // Check if next lines include the modal header
        if (i + 2 < lines.length && lines[i + 2].includes('CREATE MANUAL COURSE DIALOG')) {
            ternaryCloseIdx = i;
        }
    }
    
    if (lines[i].includes('CREATE MANUAL COURSE DIALOG INLINE MODAL')) {
        modalBlockStartIdx = i;
    }
    
    if (trimmed === ') : (' && elseIdx < 0) {
        elseIdx = i;
    }
}

// Find where the modal closes (the `)}` that matches {showCreateCourseModal && (
for (let i = modalBlockStartIdx; i < elseIdx; i++) {
    if (i <= modalBlockStartIdx) continue;
    if (lines[i].trim() === ')}') {
        // This should be the modal close
        modalBlockEndIdx = i;
        break;
    }
}

console.log(`Ternary closes at: line ${ternaryCloseIdx + 1}`);
console.log(`Modal starts at: line ${modalBlockStartIdx + 1}`);
console.log(`Modal ends at: line ${modalBlockEndIdx + 1}`);
console.log(`Else branch at: line ${elseIdx + 1}`);

// Now the fix:
// 1. Remove the ternaryClose line (it was premature)
// 2. Insert the modal block BEFORE where the ternary close was
// 3. Also remove the extra `</div>` at line ~3473 and the old `)}` at modalBlockEndIdx

// Actually, let me think differently:
// The correct structure for the ternary is:
// condition ? (
//   <>
//     ... content ...
//     {showCreateCourseModal && (...)}
//   </>
// ) : (
//   ... else content ...
// )

// Currently it's:
// condition ? (
//   ... content ...
// )                              <-- premature close
//                                <-- modal OUTSIDE ternary (BUG!)
//   {showCreateCourseModal && (...)}
//         </div>                 <-- extra closing div
//       ) : (                    <-- else of ternary
//   ... else content ...

// The fix: Remove the premature close and the extra div
// Move the modal inside the ternary

// Actually, let me verify by also checking the ELSE branch structure
console.log('\n=== Checking else branch structure ===');
for (let i = elseIdx; i < Math.min(lines.length, elseIdx + 10); i++) {
    console.log(`${i+1}: '${lines[i]}'`);
}

// Let me look at the true branch opening
console.log('\n=== Looking for true branch opening ===');
for (let i = 3000; i < 3065; i++) {
    if (lines[i].includes('(') && lines[i].includes(':') && !lines[i].includes('//')) {
        // Check for ternary pattern
    }
    if (i >= 3055 && i <= 3065) {
        console.log(`${i+1}: '${lines[i]}'`);
    }
}

// The ternary likely starts around line 3056:
// Line 3056: `            </div>`
// Line 3057: `          ) : (`
// This is closing the CREATOR VIEW and starting the ELSE

// So the CREATOR VIEW ternary starts somewhere above line 3056
// And its true branch ends at line 3349 (ternaryCloseIdx)

// The fix: 
// Remove the premature ternary close at line 3349
// Remove the extra div at line 3473
// Let the modal be part of the true branch

// New lines after fix:
// ... up to line 3348 (content) ...
// [MODAL BLOCK] inserted here
// ... closing structure ...
// }  <- ternary closes here (with proper div closing)
// ) : (  <- else

// Wait, I need to understand the exact wrapping
// The true branch at line 3057 shows: `          ) : (`
// This means the opening of the true branch is: `{something ? (`
// And the content is wrapped in parentheses

// Looking at lines 3055-3061:
// 3055: `              )}`  <-- this closes the IIFE inside the creator view
// 3056: `            </div>` <-- closes the creator view wrapper div
// 3057: `          ) : (`    <-- closes the ternary and starts else
// 3058: `            /* STANDARD STUDENT CLASSROOM VIEW */`
// 3061: `            <div id="student-classroom-dashboard">`

// So the ternary structure is:
// {something ? (
//   <div>...</div>
//   ...
//   ... line 3056: </div>  <-- this closes the true branch wrapper div
// ) : (
//   <div id="student-classroom-dashboard">...
// )}

// But the modal at lines 3351-3472 is AFTER line 3057 ) : ( ... which means
// the MODAL is after the ELSE already started! 

// Wait no, look again:
// Line 3057: `          ) : (`
// So the ELSE starts at line 3057.
// Line 3058-3060: comments
// Line 3061: `<div id="student-classroom-dashboard">` (else branch content)
// 
// This else branch continues until line 3474 where there's `) : (`
// Wait, that can't be right...

// Let me check: is there ANOTHER ternary? 
// Looking at line 3474: `      ) : (`
// This is a SECOND ternary!

// So there are TWO nested ternaries:
// Outer ternary: around line 3056/3057
// Inner ternary: around line 3348/3349 with else at line 3474

// Let me check the outer ternary opening
console.log('\n=== Searching for outer ternary structure ===');
for (let i = 2580; i < 2620; i++) {
    if (i >= 2595) console.log(`${i+1}: '${lines[i]}'`);
}

console.log('\n=== END OF ANALYSIS ===');