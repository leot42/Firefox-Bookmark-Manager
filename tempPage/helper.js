const helpers = (() => {
    'use strict';

    const clickInsideElement = (e, className) => {
        let el = e.srcElement || e.target;
        if (el.classList && el.classList.contains(className)) {
            return el;
        } else if (el = el.querySelector('span.folder_item')) {
            if (el.classList.contains(className)) {
                return el;
            }
        } else {
            el = e.srcElement || e.target;
            while (el = el.parentNode) {
                if (el.classList && el.classList.contains(className)) {
                    return el;
                }
            }
        }
        return false;
    };
    
    

    const getIconUrl = (url) => {
        const getRootUrl = (url) => url.toString().replace(/^.*\/\/([^\/?#]*).*$/, "$1");
        return `url('https://www.google.com/s2/favicons?domain=${getRootUrl(url)}')`;
    }

    /**
     * create a folders array 
     */
    const folderList = (favorites) => {
        console.log('favorites:');
        console.log(favorites);
        let folderTree = [];
        const copyChildren = (node, folder) => {
            if (node.children) { //it means the node is a folder
                let newFolder = {};
                newFolder.id = node.id;
                newFolder.title = node.title;
                if (node.parentId) newFolder.parentId = node.parentId;
                if (node.children.length > 0) {
                    newFolder.children = [];
                    node.children.forEach(child => {
                        copyChildren(child, newFolder.children);
                    });
                }
                folder.push(newFolder);
            }
        };
        favorites.children.forEach(child => {
            copyChildren(child, folderTree);
        });
        return folderTree;
    };

    const folderContents = (folder, tree) => {
        // takes only the contents of a folder within the tree and returns it
        const findChildren = (tree) => {
            const item = tree.children.find(item => item.id === folder.dataset.id);
            if (item) {
                return item;
            } else {
                for (const child of tree.children) {
                    if (child.children) {
                        const isIt = findChildren(child);
                        if (isIt) return isIt;
                    }
                }
            }
        }
        return findChildren(tree);
    };

    const folderClick = (e) => {
        const folder = helpers.clickInsideElement(e, 'folder_item');
        currentFolderId = folder ? folder.dataset.id : null;
        if (!currentFolderId) return;
        const leftFolder = foldersList.querySelector(`[data-id='${currentFolderId}']`)
        engine.openFolder(leftFolder);
    };

    const closeFolder = (folderElement) => {
        if (!folderElement) return;
        const open = 'fa-folder-open';
        const closed = 'fa-folder';
        const iconNode = folderElement.querySelector('i');
        if (iconNode.classList.contains(open)) {
            iconNode.classList.add(closed);
            iconNode.classList.remove(open);
        }
    };

    const toggleFolder = (folderElement) => {
        const openFolder = (folder) => {
            let parentSpan = null;
            const iconNode = folder.querySelector('i');
            const childUL = folder.parentNode.querySelector('ul');
            if (iconNode.classList.contains(closed)) {
                iconNode.classList.remove(closed);
                iconNode.classList.add(open);
                if (childUL) childUL.classList.remove('hideFolder');
            }
            if (parentSpan = folder.parentNode.parentNode.previousSibling) {
                openFolder(parentSpan);
            } else {
                // return;
            }
            
        };
        const parent = folderElement.parentNode;
        const open = 'fa-folder-open';
        const closed = 'fa-folder';
        const childUL = parent.querySelector('ul');
        if (folderElement.querySelector('i').classList.contains(closed)) { //if folder is open don't close it - actions on other folders close it
            openFolder(folderElement);
        } else {
            //close subfolders if clicked an open folder
            //possibly if deep nested subfolders the third and further layers might stay open...
            const children = parent.querySelector('ul');
            if (children) {
                Array.from(children.querySelectorAll('span')).forEach(child => {
                    helpers.closeFolder(child);
                });
            }
        }
        
        //close other sibling folders
        const siblings = Array.from(parent.parentNode.children);
        const closeChildren = (child) => {
            if (child.children && child.classList.contains('li_folder_item')) {
                const icon = child.querySelector('span>i');
                icon.classList.remove(open);
                icon.classList.add(closed);
                Array.from(child.querySelectorAll('ul')).forEach(ul => {
                    ul.classList.add('hideFolder');
                    if (ul.children && ul.children.length > 0) {
                        Array.from(ul.children).forEach(child => {
                            closeChildren(child);
                        });
                    }
                });
            }
            return;
        }
        siblings.forEach(child => {
            if (child != parent) {
                closeChildren(child);
            }
        });
    };

    /**
     * Drag And Drop handlers 
     */
    const dragStartHandler = (e) => { //source element
        const el = e.target;
        el.classList.add('dragged');
        e.dataTransfer.effectAllowed = 'copyMove';
        e.dataTransfer.setData('text/html', el.outerHTML);
    };

    const dragEndHandler = (e) => { //source element
        e.target.classList.remove('dragged');
    };

    const dragOverHandler = (e) => { //dest element
        if (e.preventDefault) e.preventDefault();
        if (e.ctrlKey) {
            e.dataTransfer.dropEffect = 'copy';
        } else {
            e.dataTransfer.dropEffect = 'move';
        }
        return false;
    };

    const dragEnterHandler = (e) => { //dest element
        e.target.classList.add('draggedOver');
        const folder = helpers.clickInsideElement(e, 'folder_item');
        helpers.toggleFolder(folder);
    };

    const dragLeaveHandler = (e) => { //dest element
        e.target.classList.remove('draggedOver');
        const folder = helpers.clickInsideElement(e, 'li_folder_item');
        helpers.closeFolder(folder);
    };

    const dragDropHandler = (e) => { //dest element
        if (e.stopPropagation) e.stopPropagation();
        const folderSpan = e.target;
        folderSpan.classList.remove('draggedOver');
        helpers.closeFolder(e.target);
        let currentElement;
        const destFolder = e.target.tagName.toUpperCase() == 'SPAN' ? e.target.parentNode : e.target;
        const destFolderId = destFolder.firstChild.dataset.id;
        const elString = e.dataTransfer.getData('text/html');
        const elToMove = document.createRange().createContextualFragment(elString).firstChild;
        const elToMoveParent = elToMove.firstChild.dataset.parentId;
        if (destFolder.firstChild.dataset.id === elToMoveParent) {
            console.log('the same folder'); //nothing to do here, cancel the operation => MARK YOUR CURRENT FOLDER OPEN !!!!
            return false;
        } else {
            const ctrl = e.ctrlKey ? 'copyTo' : 'moveTo';
            const favorite = elToMove.firstChild;
            const destinationFolder = destFolder.firstChild;
            // console.log(`move/copy element ${favorite.title} with id ${favorite.id} to a folder ${folder.title} with id ${folder.id}`);
            ACTIONS[ctrl](favorite, destinationFolder);
            //browser.bookmark.move();
            //copy and leave inside if ctrl pressed;
        }
        return false;
    };

    const attachDnD = (item) => {
        item.addEventListener('dragstart', helpers.dragStartHandler);
        item.addEventListener('dragend', helpers.dragEndHandler);
        if (item.classList.contains('li_folder_item')) {
            item.addEventListener('dragover', helpers.dragOverHandler);
            item.addEventListener('dragenter', helpers.dragEnterHandler);
            item.addEventListener('dragleave', helpers.dragLeaveHandler);
            item.addEventListener('drop', helpers.dragDropHandler);
        }
    };

    const rightClickListener = (linkItemClassName, contextLinkClassName, menuSelector) => { // make it more universal -> and attach to the left pane
        const menu = document.querySelector(menuSelector);
        let menuState = 0;
        const contextMenuActive = 'context-menu--active';
        let selectedElement;

        /**
         * Context-menu helper functions
         */
        const toggleMenuOn = () => {
            if (menuState != 1) {
                menuState = 1;
                menu.classList.add(contextMenuActive);
            }
        };

        const toggleMenuOff = () => {
            if (menuState != 0) {
                menuState = 0;
                menu.classList.remove(contextMenuActive);
            }
        };

        const positionMenu = (e) => {
            const cursorPosition = {
                x: e.pageX,
                y: e.pageY
            };
            const menuWidth = menu.offsetWidth + 4; // we will be at least 4px from window edge
            const menuHeight = menu.offsetHeight + 4;
            let top = (cursorPosition.y + menuHeight) > window.innerHeight ? cursorPosition.y - menuHeight : cursorPosition.y;
            let left = (cursorPosition.x + menuWidth) > window.innerWidth ? cursorPosition.x - menuWidth : cursorPosition.x;
            menu.style.top = `${top}px`;
            menu.style.left = `${left}px`;
        };

        document.addEventListener('contextmenu', (e) => {
            const el = helpers.clickInsideElement(e, linkItemClassName);
            if (el) {
                selectedElement = el;
                e.preventDefault();
                toggleMenuOn();
                positionMenu(e);
            } else {
                toggleMenuOff(); //if right clicked outside the target
            }
        }, true);

        //listen for ESC, click or window resize to dismiss the menu
        document.addEventListener('keyup', (e) => {
            if (e.keyCode === 27) toggleMenuOff();
        });

        menu.addEventListener('click', (e) => {
            let action;
            const link = helpers.clickInsideElement(e, contextLinkClassName);
            console.log(link)
            if (link) action = link.dataset.action;
            console.log(`Action: ${action}`);
            ACTIONS[action](selectedElement);
            // toggleMenuOff();
            // if ()
            // ATTACH ACTIONS TO RIGHT CLICK MENU
            // console.log(link.dataset.action);
            // console.log(`Action: ${link.dataset.action} applied to item id ${linkId}`);
        });

        document.addEventListener('click', (e) => {
            toggleMenuOff();
        });
        window.addEventListener('resize', (e) => {
            toggleMenuOff();
        });
        //show context menu, options: copy to..., move to..., rename, delete, create folder under clicked/current folder
        //when folder -> specific options: open all links in the folder, ask for confirmation!


        //when item -> specific options: open in new Tab
    };

    const hideModals = () => {
        console.log('hideModals invoked')
        Array.from(document.querySelectorAll('.hide')).forEach(modal => {
            console.log(modal)
            if (!modal.classList.contains('hidden')) modal.classList.add('hidden');
        });
        // if (!modal.classList.contains('hidden')) modal.classList.add('hidden');
        // if (!consentModal.classList.contains('hidden')) consentModal.classList.add('hidden');
        // modalOverlay.classList.add('hidden');
    };

    return {
        clickInsideElement: clickInsideElement,
        getIconUrl: getIconUrl,
        folderList: folderList,
        folderContents: folderContents,
        folderClick: folderClick,
        closeFolder: closeFolder,
        toggleFolder: toggleFolder,
        dragStartHandler: dragStartHandler,
        dragEndHandler: dragEndHandler,
        dragOverHandler: dragOverHandler,
        dragEnterHandler: dragEnterHandler,
        dragLeaveHandler: dragLeaveHandler,
        dragDropHandler: dragDropHandler,
        attachDnD: attachDnD,
        rightClickListener: rightClickListener,
        hideModals: hideModals
    }
})();