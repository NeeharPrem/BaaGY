document.addEventListener('DOMContentLoaded', function () {
    const sortingSelect = document.getElementById('sortingSelect');
    sortingSelect.addEventListener('change', function () {
        const sortingValue = this.value;
        updateUrlParams({ sort: sortingValue });
    });

    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const searchTerm = this.querySelector('input').value.trim();
        if (searchTerm !== '') {
            updateUrlParams({ search: searchTerm, page: 1 });
        } else {
            console.log("error");
        }
    });

    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const category = this.dataset.category;
            const brand = this.dataset.brand;
            const minPrice = this.dataset.minprice;
            const maxPrice = this.dataset.maxprice;
            if (category) {
                updateUrlParams({ category, page: 1 });
            } else if (brand) {
                updateUrlParams({ brand, page: 1 });
            } else if (minPrice && maxPrice) {
                updateUrlParams({ minPrice, maxPrice, page: 1 });
            }
        });
    });

    const paginationLinks = document.querySelectorAll('.pagination-link');
    paginationLinks.forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const page = this.dataset.page;
            updateUrlParams({ page });
        });
    });

    function updateUrlParams(params) {
        const currentUrl = new URL(window.location.href);
        for (const [key, value] of Object.entries(params)) {
            currentUrl.searchParams.set(key, value);
        }
        window.location.href = currentUrl.toString();
    }
});