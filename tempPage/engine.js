//global variables
let tree;
const engine = (() => {
    'use strict';

    const _populateRightPane = (tree) => {
        // const showAllToggle = showAll.checked ? true : false;
        const readData = (favorites) => {
            const ul = document.createElement('ul');
            for (const favorite of favorites) {
                console.log('favorite:');
                console.log(favorite);
                const li = document.createElement('li');
                li.setAttribute('draggable', "true");
                if (favorite.children) {
                    // processing folders
                    const span = document.createElement('span');
                    const txt = document.createTextNode(` ${favorite.title}`);
                    const icon = document.createElement('i');
                    icon.classList.add('fa', 'fa-folder');
                    span.appendChild(icon);
                    span.appendChild(txt);
                    span.style.fontWeight = 'bold';
                    span.dataset.title = favorite.title;
                    span.dataset.id = favorite.id;
                    span.dataset.parentId = favorite.parentId;
                    span.classList.add('folder_item');
                    li.appendChild(span);
                    li.classList.add('li_folder_item');
                } else {
                    // processing links
                    let span = document.createElement('span');
                    span.classList.add('link_item');
                    span.textContent = favorite.title;
                    span.dataset.title = favorite.title;
                    span.dataset.url = favorite.url;
                    span.dataset.id = favorite.id;
                    span.dataset.parentId = favorite.parentId;
                    // if (showAllToggle) {
                    //     // console.log('show all')
                    //     // span.classList.add('green')
                    // };
                    li.appendChild(span);
                    li.style.backgroundImage = helpers.getIconUrl(favorite.url);
                    li.classList.add('li_link_item');
                }
                helpers.attachDnD(li);
                ul.appendChild(li);
                ul.addEventListener('click', helpers.folderClick);
            }
            return ul;
        }
        const content = readData(tree.children);
        contentsList.innerHTML = '';
        contentsList.appendChild(content);
        return new Promise((res, rej) => {
            res(content);
        });
    };

    const _populateLeftPane = (folders) => {
        const ul = document.createElement('ul');
        ul.classList.add('hideFolder');
        for (const folder of folders) {
            const li = document.createElement('li');
            li.setAttribute('draggable', true);
            li.classList.add('li_folder_item');
            const span = document.createElement('span');
            const txt = document.createTextNode(` ${folder.title}`);
            const icon = document.createElement('i');
            icon.classList.add('fa', 'fa-folder');
            span.appendChild(icon);
            span.appendChild(txt);
            span.dataset.title = folder.title;
            span.dataset.id = folder.id;
            span.dataset.parentId = folder.parentId;
            span.classList.add('folder_item');
            li.appendChild(span);
            helpers.attachDnD(li);
            if (folder.children && folder.children.length > 0) li.appendChild(_populateLeftPane(folder.children));
            ul.appendChild(li);
        }
        return ul;
    };

    const openFolder = (folder) => {
        helpers.toggleFolder(folder);
        const rightPaneContents = helpers.folderContents(folder, tree);
        _populateRightPane(rightPaneContents);
    };

    const openCurrentFolder = (currentFolderId) => {
        if (!currentFolderId) return; //case for root folder
        const folder = foldersList.querySelector(`[data-id='${currentFolderId}']`);
        engine.openFolder(folder);
    };

    const refreshRoot = (e) => {
        // foldersList.removeEventListener('click', helpers.folderClick);
        if (e) {
            // console.log('event from refreshRoot:')
            // console.log(e);
            currentFolderId = e.target.id == 'root' ? null : currentFolderId;
        }
        const refresh = (bookmarkTree) => {
            console.log('bookmarkTree:');
            console.log(bookmarkTree);
            foldersList.innerHTML = '';
            contentsList.innerHTML = '';
            tree = bookmarkTree[0];
            console.log('tree:')
            console.log(tree);

            //populate the left pane
            foldersList.appendChild(_populateLeftPane(helpers.folderList(tree)));
            foldersList.querySelector('ul').classList.remove('hideFolder');
            
            //populate the right pane with default (main tree with collapsed folders);
            _populateRightPane(tree).then((content) => {
                
            });
        } 
        browser.bookmarks.getTree().then(refresh);
    };

    return {
        // populateRightPane: populateRightPane,
        // populateLeftPane: populateLeftPane,
        refreshRoot: refreshRoot,
        openFolder: openFolder,
        openCurrentFolder: openCurrentFolder
    }
})();

const ACTIONS = (() => {
    const refreshFavorites = () => {
        console.log(`currentFolderId: ${currentFolderId}`);
        engine.refreshRoot();
        console.log(`currentFolderId: ${currentFolderId}`);
        engine.openCurrentFolder(currentFolderId);
    };
    const createNewItem = (type, destFolderId, topIndex, title = '', url = 'about:Tabs') => {
        
        let newItem = {
            parentId: null,
            title: null
        }
        //in a modal checkmark if create at the top or not
        if (topIndex) newItem.index = 0;
        
        if (type === 'newFolder') {
            //the element is folder, create under this folderId
            console.log('new folder created')
            if (title.trim() === '') title = 'New folder';
            newItem.parentId = destFolderId;
            newItem.title = title;
        } else if (type === 'newFavorite') {
            console.log('new favorite created');
            //the element clicked is the link, create under the parentId
            if (title.trim() === '') title = 'New link';
            if (url.trim() === '') url = 'about:Tabs';
            newItem.parentId = destFolderId;
            newItem.url = url;
            newItem.title = title;
        }

        console.log(`object to create:`);
        console.log(newItem);
        browser.bookmarks.create(newItem, refreshFavorites);
    };
    const openModal = (type, callbackFn) => {
        const modal = document.querySelector('#modal');
        const modalOverlay = document.querySelector('#modal-overlay');
        const btnDone = modal.querySelector('#btnDone');
        const btnCancel = modal.querySelector('#btnCancel');
        const cancelHandlers = () => {
            modalOverlay.removeEventListener('click', overlayHandler);
            btnCancel.removeEventListener('click', cancelHandler);
            btnDone.removeEventListener('click', doneHandler);
        };
        const doneHandler = () => {
            cancelHandlers();
            callbackFn();
        };
        const cancelHandler = () => {
            console.log('Cancel button clicked');
            cancelHandlers();
        };
        const overlayHandler = () => {
            console.log('overlay clicked');
            cancelHandlers();
        }
        if (type === 'newFolder') {
            const folderModal = modal.querySelector('#newFolderModal');
            folderModal.classList.remove('hidden');
            btnDone.textContent = 'Add';
        }
        if (type === 'newFavorite') {
            const favoriteModal = modal.querySelector('#newFavoriteModal');
            favoriteModal.classList.remove('hidden');
            btnDone.textContent = 'Add';
        }
        if (type === 'rename') {
            const renameModal = modal.querySelector('#renameModal');
            renameModal.classList.remove('hidden');
            btnDone.textContent = 'Rename';
        }
        //if creating folder or link create checkmark if the user wants it inserted at the top of the list: Boolean

        modal.classList.remove('hidden');
        modalOverlay.classList.remove('hidden');
        btnDone.addEventListener('click', doneHandler);
        btnCancel.addEventListener('click', cancelHandler);
        modalOverlay.addEventListener('click', overlayHandler);
    }
    const openConsentModal = (type, folderInfo, callbackFn) => {
        const consentModal = document.querySelector('#consentModal');
        const modalOverlay = document.querySelector('#modal-overlay');
        const btnYes = consentModal.querySelector('#btnYes');
        const btnNo = consentModal.querySelector('#btnNo');
        const cancelHandlers = () => {
            modalOverlay.removeEventListener('click', overlayHandler);
            btnNo.removeEventListener('click', noHandler);
            btnYes.removeEventListener('click', yesHandler);
        }
        const overlayHandler = () => {
            console.log('overlay clicked');
            cancelHandlers();
        }
        const noHandler = () => {
            console.log('No button clicked');
            cancelHandlers();

        };
        const yesHandler = (e) => {
            cancelHandlers();
            callbackFn();
        };
        
        if (type === 'openAll') {
            consentModal.querySelector('#openAllModal').classList.remove('hidden');
            consentModal.querySelector('#linksAmount').textContent = folderInfo;
        }
        if (type === 'delete') {
            consentModal.querySelector('#folderName').textContent = folderInfo;
            consentModal.querySelector('#deleteModal').classList.remove('hidden');
        }
        consentModal.classList.remove('hidden');
        modalOverlay.classList.remove('hidden');
        btnYes.addEventListener('click', yesHandler);
        consentModal.querySelector('#btnNo').addEventListener('click', noHandler);
        modalOverlay.addEventListener('click', overlayHandler);
    }
    const openLink = (el) => {
        const url = el.dataset.url;
        window.open(url, '_blank');

        /**
         * Later use the extension API tabs.create to prevent focusing on the new tab
         */
        // browser.tabs.create({url: url, active: false})
    };

    const openAll = (el) => {
        let consent = null;
        // console.log(el)
        const folderContents = helpers.folderContents(el, tree).children.filter(item => item.url);
        // console.log(folderContents);
        const openLinks = () => {
            folderContents.forEach(link => {
                console.log(link.url)
                window.open(link.url, '_blank');
                // browser.tabs.create({ url: link.url, active: false });
            })
        };
        if (folderContents.length > 5) {

            openConsentModal('openAll', folderContents.length, openLinks);
            
            // consent = confirm('there are more than 5 links, are you sure you want to open them?'); //REPLACE WITH MODAL
            // console.log(`consent: ${consent}`);
        } else {
            openLinks();
        }

        //display modal asking if sure to open ALL the links
        //below checkmark "Don't ask again"
    };

    const copyLink = (el) => {
        const link = el.dataset.url;
        console.log(link)
        const inputField = document.createElement('input[type="text"]');
        inputField.value = link;
        document.body.appendChild(inputField);
        inputField.style.position = 'absolute';
        inputField.style.left = '-99999px';
        // inputField.focus();
        // inputField.setSelectionRange(0, inputField.value.length);
        inputField.select();
        const succeed = document.execCommand('Copy');
        console.log(`copy result: ${succeed}`);
        /**
         * DOESN'T WORK. THE ELEMENT NEEDS TO BE VISIBLE...
         */
    };

    const renameItem = (el) => {
        console.log('ACTION: rename folder or favorite');
        document.querySelector('#currentName').textContent = el.dataset.title;
        const rename = () => {
            console.log('rename function invoked')
            const newNameElement = document.querySelector('#newName');
            const newTitle = newNameElement.value;
            newNameElement.value = '';
            if (newTitle.length === 0) return; +
            //check if the name already exists, if so add a number to it    
            console.log(`new name for item is ${newTitle}`);
            try {
                browser.bookmarks.update(el.dataset.id, {
                    title: newTitle,
                    // url: newURL //if it's a link add option to change it as well
                }, refreshFavorites);
            } catch (e) {
                alert('Rename operation failed !!!');
            }

        }
        openModal('rename', rename);
    };

    const deleteItem = (el) => {
        console.dir(el);
        if (el.classList.contains('folder_item')) {
            console.log('ACTION: remove a folder with all its contents');
            openConsentModal('delete', el.dataset.title, () => {
                console.log('deleting...');
                browser.bookmarks.removeTree(el.dataset.id, () => {
                    currentFolderId = el.dataset.parentId;
                    refreshFavorites;
                });
            });
        } else if (el.classList.contains('link_item')) {
            console.log('ACTION: remove a favorite or an empty folder');
            browser.bookmarks.remove(el.dataset.id, refreshFavorites);
        }
    };

    const copyTo = (favorite, destFolder, index) => {

        //open a modal window with the list of folders to copy to. 
        //the list may be in the form of <SELECT> elements -> applies to right click copy function - not implemented in this version
        console.log('ACTION: COPY');
        const type = favorite.dataset.url ? 'newFavorite' : 'newFolder';
        console.log(`type: ${type}`);
        const title = favorite.dataset.title;
        console.log(`title: ${title}`);
        const topIndex = index || null;
        console.log(`index: ${topIndex}`);
        const url = favorite.dataset.url || null;
        console.log(`url: ${url}`);
        createNewItem(type, destFolder.dataset.id, topIndex, title, url);
    }

    const moveTo = (favorite, folder, index) => {
        //index not in use in this version
        //the same as copyTo
        console.log('ACTION: MOVE');
        console.log(`favorite ${favorite.dataset.title} moved to ${folder.dataset.title}`);
        browser.bookmarks.move(favorite.dataset.id, {parentId: folder.dataset.id}, refreshFavorites());
    };

    const createFolder = (el) => {
        const type = 'newFolder';
        const newFolder = () => {
            console.log('createFolder invoked');
            const newFolderName = document.querySelector('#newFolderName');
            const newFolderCheckbox = document.querySelector('#newFolderCheckbox');
            const destFolderId = el.dataset.parentId;
            const title = newFolderName.value;
            const topIndex = newFolderCheckbox.checked;
            newFolderName.value = '';
            newFolderCheckbox.checked = false;
            
            createNewItem(type, destFolderId, topIndex, title);
        };

        openModal(type, newFolder);
        //get folder name/title, check if topIndex
        // const title = '  ';
        

        //ask for a title
        
        console.log('ACTION: create new folder');
        console.log(el);
        
    };

    const createFavorite = (el) => {
        const type = 'newFavorite';
        const newFavorite = () => {
            console.log('createFavorite invoked');
            const newFavoriteName = document.querySelector('#newFavoriteName');
            const newFavoriteAddress = document.querySelector('#newFavoriteAddress');
            const newFavoriteCheckbox = document.querySelector('#newFavoriteCheckbox');
            const destFolderId = el.dataset.parentId;
            const title = newFavoriteName.value;
            const url = newFavoriteAddress.value;
            const topIndex = newFavoriteCheckbox.checked;
            newFavoriteName.value = '';
            newFavoriteAddress.value = '';
            newFavoriteCheckbox.checked = false;
            createNewItem(type, destFolderId, topIndex, title, url);
        }
        openModal(type, newFavorite);
    };

    return {
        openLink: openLink,
        openAll: openAll,
        copyLink: copyLink,
        renameItem: renameItem,
        deleteItem: deleteItem,
        copyTo: copyTo,
        moveTo: moveTo,
        createFolder: createFolder,
        createFavorite: createFavorite
    };
})();