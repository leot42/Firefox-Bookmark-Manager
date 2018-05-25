let currentFolderId = null;
let confirmation = false;

(() => {
    'use strict';

    const init = () => {
        
        const contentsPane = document.querySelector('#contentsPane');
        const contentsList = contentsPane.querySelector('#contentsList');
        const foldersPane = document.querySelector('#foldersPane');
        const foldersList = foldersPane.querySelector('#foldersList');
        const showAll = document.querySelector('#showAll');
        const modalOverlay = document.querySelector('#modal-overlay');
        const btnYes = document.querySelector('#btnYes');
        const btnNo = document.querySelector('#btnNo');
        const btnCancel = document.querySelector('#btnCancel');
        const btnDone = document.querySelector('#btnDone');

        /**
         * REMOVE THIS
         */
        // const head = document.querySelector('header')
        // head.style.backgroundImage = 'url(https://www.google.com/s2/favicons?domain=esar.us)';
        // console.log(head.style.backgroundImage);
        /**
         * END OF REMOVE
         */

        
        engine.refreshRoot();
        document.querySelector('#root').addEventListener('click', engine.refreshRoot);
        foldersList.addEventListener('click', helpers.folderClick);
        helpers.rightClickListener('link_item', 'context-menu__link', '#context-menu');
        helpers.rightClickListener('folder_item', 'context-menu__folder', '#folder-context-menu');

        //modals listeners
        modalOverlay.addEventListener('click', helpers.hideModals);
        btnYes.addEventListener('click', helpers.hideModals);
        btnNo.addEventListener('click', helpers.hideModals);
        btnCancel.addEventListener('click', helpers.hideModals);
        btnDone.addEventListener('click', helpers.hideModals);

    };
    document.addEventListener('DOMContentLoaded', init);
})();