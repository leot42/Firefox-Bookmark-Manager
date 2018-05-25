(function () { 
    const init = () => {
        const showTab = (e) => {
            const links = Array.from(navLink.querySelectorAll('li'));
            links.forEach(link => link.classList.remove('active'));
            const el = e.target.nodeName === 'SPAN' ? e.target.parentNode : e.target;
            el.classList.add('active');
            const target = el.dataset.target;
            const sections = Array.from(document.querySelectorAll('section'));
            sections.forEach(section => {
                section.classList.remove('show');
                if (section.id === target && !section.classList.contains('show')) section.classList.add('show');
            });
        };
        const navLink = document.querySelector('nav');
        navLink.addEventListener('click', showTab);
    };

    document.addEventListener('DOMContentLoaded', init);
})();

//use storage API https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/storage
// listen for changes with storage.onChanged
