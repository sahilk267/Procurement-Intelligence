const fs = require('fs');
const path = require('path');

const filePath = 'e:/procurement-intelligence/Procurement-Intelligence/frontend/app/dashboard/analytics/page.tsx';
const importPath = '../../../lib/api';

const resolvedPath = path.resolve(path.dirname(filePath), importPath);
console.log('File:', filePath);
console.log('Import:', importPath);
console.log('Resolved:', resolvedPath);

const extensions = ['.ts', '.tsx', '.js', '.jsx'];
let found = false;
for (const ext of extensions) {
    if (fs.existsSync(resolvedPath + ext)) {
        console.log('FOUND:', resolvedPath + ext);
        found = true;
        break;
    }
}

if (!found) {
    if (fs.existsSync(resolvedPath)) {
        console.log('FOUND (no ext):', resolvedPath);
    } else {
        console.log('NOT FOUND');
    }
}
