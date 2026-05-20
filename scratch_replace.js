const fs = require('fs');
const path = require('path');
const dir = 'f:/PHP/shop/frontend';

function processHtmlFiles(dirPath) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processHtmlFiles(fullPath);
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // standardise the input id
            if (content.match(/<input type="text"\s+placeholder="Tìm kiếm sản phẩm"/)) {
                content = content.replace(/<input type="text"\s+placeholder="Tìm kiếm sản phẩm"/g, '<input type="text" id="search-input" placeholder="Tìm kiếm sản phẩm"');
                modified = true;
            }

            // standardise the search button
            const buttonRegex = /<button class="absolute right-4 top-1\/2 -translate-y-1\/2 text-gray-400 hover:text-primary"(?:\s+onclick="loadProducts\(1\)")?>/g;
            if (content.match(buttonRegex)) {
                content = content.replace(buttonRegex, '<button class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary" onclick="performGlobalSearch()">');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated', fullPath);
            }
        }
    });
}

processHtmlFiles(dir);
