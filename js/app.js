document.addEventListener('DOMContentLoaded', () => {
    const catalogGrid = document.getElementById('catalogGrid');
    const searchInput = document.getElementById('searchInput');
    const filterNav = document.getElementById('filterNav');
    const emptyState = document.getElementById('emptyState');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    let currentFilter = 'all';
    let currentSearchQuery = '';
    
    const ITEMS_PER_PAGE = 6;
    let visibleItemsCount = ITEMS_PER_PAGE;

    function getBadgeClass(category) {
        return `course-card__badge_${category}`;
    }

    function getCategoryLabel(category) {
        if (category === 'hr') return 'HR & Recruiting';
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    function renderFilters() {
        if (!filterNav) return;

        const counts = {
            all: COURSES_DATA.length,
            marketing: 0,
            management: 0,
            hr: 0,
            design: 0,
            development: 0
        };

        COURSES_DATA.forEach(item => {
            if (counts[item.category] !== undefined) {
                counts[item.category]++;
            }
        });

        const categories = ['all', 'marketing', 'management', 'hr', 'design', 'development'];
        
        filterNav.innerHTML = categories.map(cat => {
            const isActive = cat === currentFilter ? 'filter__btn_active' : '';
            const label = cat === 'all' ? 'All' : getCategoryLabel(cat);
            return `
                <button class="filter__btn ${isActive}" data-category="${cat}">
                    ${label} <sup class="filter__count">${counts[cat]}</sup>
                </button>
            `;
        }).join('');

        const filterButtons = filterNav.querySelectorAll('.filter__btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clickedBtn = e.currentTarget;
                
                filterNav.querySelectorAll('.filter__btn').forEach(b => b.classList.remove('filter__btn_active'));
                clickedBtn.classList.add('filter__btn_active');

                currentFilter = clickedBtn.dataset.category;
                visibleItemsCount = ITEMS_PER_PAGE; 
                updateInterface(false);
            });
        });
    }

    function createCardHTML(item, index) {
        const badgeClass = getBadgeClass(item.category);
        const categoryLabel = getCategoryLabel(item.category);
        const courseLink = item.link || '#';

        return `
            <article class="course-card course-card_fade-in" data-category="${item.category}" style="animation-delay: ${index * 40}ms">
                <div class="course-card__img-wrapper">
                    <img src="${item.img}" alt="${item.title}" class="course-card__img" loading="lazy">
                </div>
                <div class="course-card__content">
                    <span class="course-card__badge ${badgeClass}">${categoryLabel}</span>
                    <h3 class="course-card__title">
                        <a href="${courseLink}" class="course-card__link">${item.title}</a>
                    </h3>
                    <div class="course-card__meta">
                        <span class="course-card__price">${item.price}</span>
                        <span class="course-card__author">${item.author}</span>
                    </div>
                </div>
            </article>
        `;
    }

    function renderCatalog(items, isAppend = false) {
        if (items.length === 0) {
            catalogGrid.innerHTML = '';
            emptyState.classList.remove('courses__empty_hidden');
            loadMoreBtn.style.display = 'none';
            return;
        }
        emptyState.classList.add('courses__empty_hidden');

        let itemsToRender = [];
        let startIndexDelay = 0;

        if (isAppend) {
            itemsToRender = items.slice(visibleItemsCount - ITEMS_PER_PAGE, visibleItemsCount);
            startIndexDelay = 0;
        } else {
            itemsToRender = items.slice(0, visibleItemsCount);
            catalogGrid.innerHTML = '';
        }

        const fragment = document.createDocumentFragment();
        const tempContainer = document.createElement('div');

        itemsToRender.forEach((item, index) => {
            tempContainer.innerHTML = createCardHTML(item, startIndexDelay + index);
            if (tempContainer.firstElementChild) {
                fragment.appendChild(tempContainer.firstElementChild);
            }
        });

        catalogGrid.appendChild(fragment);

        if (items.length <= visibleItemsCount) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-flex';
        }
    }

    function getFilteredData() {
        return COURSES_DATA.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(currentSearchQuery.toLowerCase());
            const matchesCategory = currentFilter === 'all' || item.category === currentFilter;
            return matchesSearch && matchesCategory;
        });
    }

    function updateInterface(isAppend = false) {
        const filteredData = getFilteredData();
        renderCatalog(filteredData, isAppend);
    }

    function debounce(func, delay = 250) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    const handleSearchInput = debounce((e) => {
        const query = e.target.value;
        const trimmedQuery = query.trim();

        if (query.length > 0 && trimmedQuery.length === 0) {
            return;
        }

        if (currentSearchQuery === trimmedQuery) {
            return;
        }

        currentSearchQuery = trimmedQuery;
        visibleItemsCount = ITEMS_PER_PAGE;
        updateInterface(false);
    });

    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
    }

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            visibleItemsCount += ITEMS_PER_PAGE;
            updateInterface(true);
        });
    }

    renderFilters();
    updateInterface(false);
});