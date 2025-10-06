import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/esm/index.js';

const priceFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
});

const menuStatusEl = document.getElementById('menu-status');
const specialsGrid = document.getElementById('specials-grid');
const menuGrid = document.getElementById('menu-grid');

function setMenuStatus(message, variant = 'info') {
    if (!menuStatusEl) {
        return;
    }

    if (!message) {
        menuStatusEl.textContent = '';
        menuStatusEl.classList.remove('menu-status--error');
        menuStatusEl.hidden = true;
        return;
    }

    menuStatusEl.hidden = false;
    menuStatusEl.textContent = message;
    menuStatusEl.classList.toggle('menu-status--error', variant === 'error');
}

async function loadSupabaseConfig() {
    try {
        const module = await import('./supabase-config.js');
        const url = module.SUPABASE_URL ?? module.default?.SUPABASE_URL;
        const anonKey = module.SUPABASE_ANON_KEY ?? module.default?.SUPABASE_ANON_KEY;

        if (!url || !anonKey) {
            throw new Error('Supabase URL or anon key missing');
        }

        return { url, anonKey };
    } catch (error) {
        console.warn('Supabase configuration is missing. Create supabase-config.js based on supabase-config.example.js.', error);
        return null;
    }
}

function normaliseOrder(value) {
    if (value === null || value === undefined) {
        return Number.POSITIVE_INFINITY;
    }
    return Number(value);
}

function sortMenuItems(items) {
    return [...items].sort((a, b) => {
        const orderDiff = normaliseOrder(a.display_order) - normaliseOrder(b.display_order);
        if (orderDiff !== 0) {
            return orderDiff;
        }

        return (a.name || '').localeCompare(b.name || '');
    });
}

function formatPrice(priceCents) {
    if (typeof priceCents !== 'number' || Number.isNaN(priceCents)) {
        return '';
    }

    return priceFormatter.format(priceCents / 100);
}

function createMenuCard(item) {
    const card = document.createElement('article');
    card.className = 'menu-card';

    const image = document.createElement('div');
    image.className = 'menu-image';
    if (item.image_url) {
        image.style.backgroundImage = `url('${item.image_url}')`;
    } else {
        image.classList.add('menu-image--placeholder');
    }
    card.appendChild(image);

    const info = document.createElement('div');
    info.className = 'menu-info';

    const title = document.createElement('h3');
    title.textContent = item.name ?? 'Untitled Dish';
    info.appendChild(title);

    if (item.description) {
        const description = document.createElement('p');
        description.textContent = item.description;
        info.appendChild(description);
    }

    const priceText = formatPrice(item.price_cents);
    if (priceText) {
        const price = document.createElement('span');
        price.className = 'price';
        price.textContent = priceText;
        info.appendChild(price);
    }

    card.appendChild(info);
    return card;
}

function renderMenuSection(container, items, emptyMessage) {
    if (!container) {
        return;
    }

    container.innerHTML = '';

    if (!items || items.length === 0) {
        if (emptyMessage) {
            const emptyState = document.createElement('p');
            emptyState.className = 'menu-empty';
            emptyState.textContent = emptyMessage;
            container.appendChild(emptyState);
        }
        return;
    }

    items.forEach(item => {
        container.appendChild(createMenuCard(item));
    });
}

async function loadMenu() {
    if (!specialsGrid || !menuGrid) {
        return;
    }

    setMenuStatus('Loading menu...');

    const config = await loadSupabaseConfig();
    if (!config) {
        setMenuStatus('Supabase configuration missing. Add your project credentials to supabase-config.js to load the menu.', 'error');
        return;
    }

    const client = createClient(config.url, config.anonKey);
    const { data, error } = await client
        .from('menu_items')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true });

    if (error) {
        console.error('Failed to fetch menu items from Supabase', error);
        setMenuStatus('We could not load the menu at this time. Please try again later.', 'error');
        return;
    }

    if (!data || data.length === 0) {
        setMenuStatus('Menu data has not been added yet. Check back soon!');
        renderMenuSection(specialsGrid, []);
        renderMenuSection(menuGrid, []);
        return;
    }

    setMenuStatus('');

    const sortedItems = sortMenuItems(data);
    const specials = sortedItems.filter(item => item.is_featured);

    renderMenuSection(specialsGrid, specials, 'No featured dishes are available right now.');
    renderMenuSection(menuGrid, sortedItems, 'No dishes have been added yet.');
}

function initUI() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', event => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                event.preventDefault();
                document.querySelector(targetId)?.scrollIntoView({
                    behavior: 'smooth',
                });
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initUI();
    loadMenu();
});
