(function () {
    const init = () => {
        
        const printTree = (tree) => {
            console.log(tree[0]);
            const right = document.querySelector('#right');
            const left = document.querySelector('#left');

            /**
             * parse a result of getTree function and produce a ul/li list of favorites
             */
            const makeList = (favorites) => {
                const ul = document.createElement('ul');
                for (const favorite of favorites) {
                    const li = document.createElement('li');
                    if (favorite.children) {
                        // it's a folder so take title as a folder name and insert another ul with its children
                        const span = document.createElement('span');
                        span.style.fontWeight = 'bold';
                        span.innerHTML = favorite.title;
                        li.appendChild(span);
                        li.appendChild(makeList(favorite.children));
                    } else {
                        const span = document.createElement('span');
                        span.textContent = favorite.title;
                        const a = document.createElement('a');
                        a.href = favorite.url;
                        a.appendChild(span);
                        const fullSpan = document.createElement('span');
                        const img = document.createElement('img');
                        img.src = `https://www.google.com/s2/favicons?domain=${a.hostname}`;
                        img.width = '16';
                        img.height = '16';
                        fullSpan.appendChild(img);
                        fullSpan.appendChild(a);
                        li.appendChild(fullSpan);
                    }
                    ul.appendChild(li);
                }
                
                return ul;
            }
            right.appendChild(makeList(tree[0].children)); //there's a bug in Edge and tree is not a correct JS object. However although it prints out an error it does provide the list of favorites
        };

        document.querySelector('button#tree').addEventListener('click', (e) => {
            browser.bookmarks.getTree(printTree);
        });
        document.querySelector('button#options').addEventListener('click', (e) => {
            // DOESN'T WORK
            // browser.runtime.openOptionsPage();
        });
    };

    document.addEventListener('DOMContentLoaded', init);
})();