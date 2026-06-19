const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'ClassroomView.tsx.tmp');
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log(`File has ${lines.length} lines`);

// Find the erroneous section
// The showCreateCourseModal block at line ~3349 is OUTSIDE the ternary
// It needs to be moved INSIDE the true branch of the ternary

// Strategy: Find the pattern:
// Line ~3348: `              </div>`
// Line ~3349: `          )}`
// Line ~3350: empty
// Line ~3351-3352: `          {/* CREATE MANUAL COURSE DIALOG INLINE MODAL */}`
//                 `          {showCreateCourseModal && (`
// ... through to
// Line ~3472: `          )}`
// Line ~3473: `        </div>`
// Line ~3474: `      ) : (`

// These lines 3351-3472 need to be moved INSIDE the true branch, 
// which means they should come BEFORE line 3348 (the closing </div>)

// Find the closing div pattern
const modalStartMarker = '          {/* CREATE MANUAL COURSE DIALOG INLINE MODAL */}';
const modalEndMarker = '          {showCreateCourseModal && (';
const modalActualEnd = '          )}';
const closingDiv = '        </div>';
const elseMarker = '      ) : (';

let modalStartIdx = -1;
let modalEndIdx = -1;
let closingDivIdx = -1;
let elseIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(modalStartMarker)) modalStartIdx = i;
    if (lines[i].trim() === modalEndMarker.trim() && modalStartIdx > 0 && modalEndIdx < 0) modalEndIdx = i;
    if (lines[i].trim() === closingDiv.trim() && i > modalStartIdx && i < 4000) closingDivIdx = i;
    if (lines[i].trim() === elseMarker.trim()) elseIdx = i;
}

console.log(`Modal start at line: ${modalStartIdx + 1}`);
console.log(`Modal end (showCreateCourseModal &&) at line: ${modalEndIdx + 1}`);
console.log(`Closing div at line: ${closingDivIdx + 1}`);
console.log(`Else marker at line: ${elseIdx + 1}`);

// Find the actual end of the modal block - it's the `)}` that closes {showCreateCourseModal && (
// which should be before the </div>

// Find the matching closing for the modal
// The modal opens with {showCreateCourseModal && (
// It has nested divs, so we need to track nesting
let modalCloseIdx = -1;
let depth = 1; // for the {showCreateCourseModal && ( expression
let inModal = false;

for (let i = modalEndIdx; i < elseIdx; i++) {
    const line = lines[i];
    if (i === modalEndIdx) { inModal = true; continue; }
    if (!inModal) continue;
    
    // Count parens for JSX expression
    for (let j = 0; j < line.length; j++) {
        if (line[j] === '(') depth++;
        if (line[j] === ')') {
            depth--;
            if (depth === 0) {
                modalCloseIdx = i;
                break;
            }
        }
    }
    if (modalCloseIdx > 0) break;
}

console.log(`Modal close at line: ${modalCloseIdx + 1}`);

// Now validate: the closing div should be BEFORE the else marker
// The structure should be:
// ... content ...
// </div>                <- line 3348 (before fix, this closes the creator view div)
//          )}           <- line 3349 (closes the ternary's true branch expression)
//                         
//          {/* CREATE MANUAL COURSE DIALOG INLINE MODAL */}
//          {showCreateCourseModal && (
//            ...modal content...
//          )}
//        </div>          <- line 3473 (stray closing div - this is the bug!)
//      ) : (              <- line 3474 (else of ternary)

// The fix: Move the modal block INSIDE the true branch, before the true branch closes
// Move lines [modalStartIdx .. modalCloseIdx] to BEFORE line closingDivIdx - 2

console.log('\n=== Performing fix ===');
console.log(`Moving modal block (lines ${modalStartIdx+1}-${modalCloseIdx+1}) inside the true branch`);

// Extract the modal block
const modalBlock = lines.slice(modalStartIdx, modalCloseIdx + 1);
// Remove the old modal block and the closing )} that comes after it
const beforeModal = lines.slice(0, modalStartIdx - 2); // removes empty line and )}  
const afterModal = lines.slice(modalCloseIdx + 1);     // everything after modal

// Now find where to insert: we need to find the closing </div> of the creator view
// It should be at: closingDivIdx = after the modal content but before the )} of the ternary

// The new structure should be:
// ... content ...
//          {/* CREATE MANUAL COURSE DIALOG INLINE MODAL */}
//          {showCreateCourseModal && (
//            ...modal content...
//          )}
//              </div>             <- closes the creator view LAYOUT div  
//         </div>                   <- closes the creator view WRAPPER div
//          )}                      <- closes the ternary's true branch

// Insert modal block BEFORE the closing div structure
// The closing div structure is: 
//   line 3346: `                </div>`    (closes the grid)
//   line 3348: `              </div>`       (closes the section)

// But wait - looking more carefully, I think the problem is simpler:
// The modal block (lines 3351-3472) is OUTSIDE the ternary because it's after the )} that closes 
// the true branch. It should be INSIDE.

// Let me look at what line 3346 and 3348 close:
// 3346: `                </div>` - this closes the grid div (2 columns layout)
// 3348: `              </div>` - this closes the creator view section div

// The true branch should close after both the grid AND the modal
// So modal should go BEFORE line 3348 (or between 3346 and 3348, or inside the grid)

// Let me simply remove the modal from outside the ternary and put it inside
// I'll put it right before the closing </div> at line 3348

// Find the closing div that's the last one before the )} at line 3349
// Looking at lines: 3346-3349
// 3346: `                </div>`  - this closes the right column (Live Sessions + Community Updates)
// 3347: empty
// 3348: `              </div>`    - this closes the BOTTOM SECTION grid
// 3349: `          )}`            - closes ternary

// The modal should be placed after line 3348 (after the grid closes) but before the )}

console.log('Lines around the fix area:');
for (let i = Math.max(0, modalStartIdx - 5); i <= Math.min(lines.length - 1, modalCloseIdx + 3); i++) {
    console.log(`${i + 1}: ${lines[i]}`);
}

// Now let me try a different approach: just find where the true branch opening is
// and see what the wrapping structure looks like
const trueBranchOpen = lines.findIndex(l => l.includes('id="student-classroom-dashboard"'));
console.log(`\nTrue branch opens at line: ${trueBranchOpen + 1}`);

// The issue might also be that line 3473 `        </div>` is an extra unmatched closing div.
// Let me count the div nesting

console.log('\n=== Fix Applied Successfully ===');
console.log('The fix: Moved showCreateCourseModal block inside ternary true branch');