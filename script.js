const API_BASE_URL = "http://192.168.1.5:8000";

let dataStore = {
    users: [],
    categories: [],
    expenses: [],
    income: []
};

// data
async function loadAllData() {

    try {

        console.log("Conectando...");

        const ts = Date.now();
        const opts = { cache: 'no-store' };

        // USERS
        const uRes = await fetch(
            `${API_BASE_URL}/admin/users?_=${ts}`,
            opts
        );

        dataStore.users = await uRes.json();

        // STATS
        const statsRes = await fetch(
            `${API_BASE_URL}/admin/stats?_=${ts}`,
            opts
        );

        dataStore.stats = await statsRes.json();

        // ALL CATEGORIES
        const cRes = await fetch(
            `${API_BASE_URL}/all-categories?_=${ts}`,
            opts
        );

        dataStore.categories = await cRes.json();

        console.log(
        "Categorias:",
        dataStore.categories
        );

        console.log("Usuarios:", dataStore.users);

        console.log("Stats:", dataStore.stats);

        updateStatus(true);

        renderDashboard();

    } catch (error) {

        console.error(
            "Error conectando al backend:",
            error
        );

        updateStatus(false);
    }
}

// Estado backend
function updateStatus(online) {

    const dot = document.getElementById('status-dot');

    const text = document.getElementById('status-text');

    dot.className = `dot ${online ? 'online' : 'offline'}`;

    text.innerText = online
        ? "Backend Conectado"
        : "Backend Offline";
}

// Vista de usuarios
function renderDashboard() {

    const totalIncome =
        dataStore.stats?.total_income || 0;

    const totalExpenses =
        dataStore.stats?.total_expenses || 0;

    document.getElementById('stat-total-users').innerText =
        dataStore.users.length;

    document.getElementById('stat-total-income').innerText =
        `$${totalIncome.toLocaleString()}`;

    document.getElementById('stat-total-expenses').innerText =
        `$${totalExpenses.toLocaleString()}`;

    const tbody = document.getElementById('user-table-body');

    tbody.innerHTML = dataStore.users.map(u => `

        <tr>

            <td>

                <div style="
                    display:flex;
                    align-items:center;
                    gap:10px;
                ">

                    <img
                        src="https://ui-avatars.com/api/?name=${u.full_name}&background=6366f1&color=fff"
                        style="
                            width:34px;
                            height:34px;
                            border-radius:50%;
                        "
                    >

                    <span style="font-weight:500;">
                        ${u.full_name}
                    </span>

                </div>

            </td>

            <td style="color:var(--text-dim)">
                ${u.email}
            </td>

            <td style="
                font-family:monospace;
                font-size:0.8rem;
            ">
                #${u.id}
            </td>

            <td>

                <button
                    class="btn-view"
                    onclick="openDrawer(${u.id})"
                >
                    Ver Perfil
                </button>

            </td>

        </tr>

    `).join('');
}

// Clasificador de categorrias
async function renderCategories() {

    const container = document.getElementById(
        'categories-container'
    );

    if (!container) return;

   // MOTHER CATEGORIES
    const motherRes = await fetch(
        `${API_BASE_URL}/mother-categories?_=${Date.now()}`,
        { cache: 'no-store' }
    );

    const motherCategories = await motherRes.json();

    if (
        !dataStore.categories ||
        dataStore.categories.length === 0
    ) {

        container.innerHTML = `
            <div class="glass" style="
                padding:20px;
                border-radius:16px;
            ">
                No hay categorías registradas
            </div>
        `;

        return;
    }

    container.innerHTML = dataStore.categories.map(cat => {

        const options = motherCategories.map(m => `

            <option
                value="${m.id}"
                ${m.id === cat.mother_category_id ? 'selected' : ''}
            >
                ${m.nombre}
            </option>

        `).join('');

        return `

            <div class="glass" style="
                padding:20px;
                border-radius:16px;
                margin-bottom:15px;
            ">

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:20px;
                ">

                    <div>

                        <h3 style="
                            margin-bottom:10px;
                            font-size:1.1rem;
                        ">
                            ${cat.nombre}
                        </h3>

                        <p style="
                            color:var(--text-dim);
                            font-size:0.9rem;
                        ">
                            Usuario ID:
                            ${cat.id_usuario}
                        </p>

                    </div>

                    <div style="
                        display:flex;
                        flex-direction:column;
                        gap:10px;
                        min-width:220px;
                    ">

                        <select
                            id="select-${cat.id}"
                            style="
                                padding:10px;
                                border-radius:10px;
                                background:#111;
                                color:white;
                                border:1px solid rgba(255,255,255,0.1);
                            "
                        >

                            ${options}

                        </select>

                        <button
                            class="btn-view"
                            onclick="reclassifyCategory('${cat.id}')"
                        >
                            Guardar
                        </button>

                    </div>

                </div>

            </div>

        `;

    }).join('');
}

// =====================================================
// OPEN DRAWER
// =====================================================
function openDrawer(userId) {

    const user = dataStore.users.find(
        u => u.id === userId
    );

    if (!user) return;

    const userCategories = dataStore.categories.filter(
        c => c.id_usuario === userId
    );

    const categoriesHTML = userCategories.length > 0

        ? userCategories.map(cat => `

            <div style="
                padding:12px;
                background:rgba(255,255,255,0.03);
                border:1px solid rgba(255,255,255,0.06);
                border-radius:10px;
                margin-bottom:10px;
                display:flex;
                justify-content:space-between;
                align-items:center;
            ">

                <div>
                    📁 ${cat.nombre}
                </div>

                <button
                    class="btn-view"
                    style="
                        padding:6px 12px;
                        font-size:0.85rem;
                    "
                    onclick="goToCategory('${cat.id}')"
                >
                    Clasificar
                </button>

            </div>

        `).join('')

        : `

            <p style="
                color:var(--text-dim);
                font-size:0.9rem;
            ">
                Este usuario no tiene categorías.
            </p>

        `;

    const body = document.getElementById('drawer-body');

    body.innerHTML = `

        <div style="
            display:flex;
            flex-direction:column;
            gap:20px;
        ">

            <!-- HEADER -->
            <div style="
                text-align:center;
                padding-bottom:20px;
                border-bottom:1px solid rgba(255,255,255,0.08);
            ">

                <img
                    src="https://ui-avatars.com/api/?name=${user.full_name}&size=120&background=6366f1&color=fff"
                    style="
                        width:100px;
                        height:100px;
                        border-radius:50%;
                        margin-bottom:15px;
                    "
                >

                <h2 style="
                    margin-bottom:8px;
                    font-size:1.5rem;
                ">
                    ${user.full_name}
                </h2>

                <p style="
                    color:var(--text-dim);
                    font-size:0.9rem;
                ">
                    ${user.email}
                </p>

            </div>

            <!-- CATEGORIES -->
            <div>

                <h3 style="
                    margin-bottom:15px;
                    font-size:1rem;
                ">
                    📁 Categorías del usuario
                </h3>

                ${categoriesHTML}

            </div>

            <!-- ACTIONS -->
            <div style="
                display:flex;
                flex-direction:column;
                gap:14px;
                margin-top:10px;
            ">

                <button
                    class="btn-view drawer-btn"
                    onclick="showHistory(${user.id})"
                >
                    📜 Ver historial
                </button>

                <button class="btn-view drawer-btn">
                    🔑 Cambiar contraseña
                </button>

                <button
                    class="btn-view drawer-btn"
                    onclick="deleteUser(${user.id})"
                    style="
                        background:rgba(255,0,0,0.1);
                        border-color:rgba(255,0,0,0.2);
                        color:#ff6b6b;
                    "
                >
                    🗑 Eliminar cuenta
                </button>

            </div>

        </div>

    `;

    document.getElementById('user-drawer')
        .classList.add('open');

    document.getElementById('drawer-overlay')
        .classList.add('open');
}

// Historial
async function showHistory(userId) {

    try {

        const response = await fetch(
            `${API_BASE_URL}/activity-logs/${userId}`
        );

        const logs = await response.json();

        const body = document.getElementById('drawer-body');

        const logsHTML = logs.length > 0

            ? logs.map(log => `

                <div style="
                    padding:15px;
                    background:rgba(255,255,255,0.03);
                    border:1px solid rgba(255,255,255,0.06);
                    border-radius:12px;
                    margin-bottom:15px;
                ">

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        margin-bottom:8px;
                    ">

                        <strong>
                            ${log.tipo.toUpperCase()}
                        </strong>

                        <span style="
                            color:var(--text-dim);
                            font-size:0.8rem;
                        ">
                            ${new Date(log.fecha).toLocaleString()}
                        </span>

                    </div>

                    <p style="
                        color:#ddd;
                        line-height:1.4;
                    ">
                        ${log.descripcion}
                    </p>

                </div>

            `).join('')

            : `

            <p style="
                color:var(--text-dim);
            ">
                No hay historial disponible.
            </p>

        `;

        body.innerHTML = `

            <div>

                <button
                    class="btn-view"
                    style="margin-bottom:20px;"
                    onclick="openDrawer(${userId})"
                >
                    ← Volver
                </button>

                <h2 style="
                    margin-bottom:20px;
                ">
                    📜 Historial
                </h2>

                ${logsHTML}

            </div>

        `;

    } catch (error) {

        console.error(error);

        alert("Error cargando historial");
    }
}

// Analisis
async function renderAnalytics() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/analytics/category-distribution?_=${Date.now()}`,
            { cache: 'no-store' }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const analytics = await response.json();

        const items = analytics.filter(a => a.total > 0);

        const grandTotal = items.reduce(
            (sum, a) => sum + a.total,
            0
        );

        const itemsWithPct = items
            .map(a => ({
                nombre: a.nombre,
                total: a.total,
                percentage: grandTotal > 0
                    ? +(a.total / grandTotal * 100).toFixed(1)
                    : 0,
            }))
            .sort((a, b) => b.total - a.total);

        const labels = itemsWithPct.map(i => i.nombre);
        const data = itemsWithPct.map(i => i.total);

        const palette = [
            '#7F5AF0',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#6366F1',
            '#06B6D4',
            '#EC4899',
        ];

        const ranking = document.getElementById(
            'analytics-ranking'
        );

        if (itemsWithPct.length === 0) {
            ranking.innerHTML = `
                <p style="color:var(--text-dim);">
                    No hay gastos clasificados todavía.
                </p>
            `;
        } else {
            ranking.innerHTML = itemsWithPct.map((item, index) => `

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    padding:14px 0;
                    border-bottom:1px solid rgba(255,255,255,0.06);
                ">

                    <div style="display:flex; align-items:center; gap:10px;">

                        <span style="
                            width:12px;
                            height:12px;
                            border-radius:50%;
                            background:${palette[index % palette.length]};
                            display:inline-block;
                        "></span>

                        <strong>#${index + 1}</strong>

                        ${item.nombre}

                    </div>

                    <div style="
                        color:#818cf8;
                        font-weight:600;
                    ">
                        ${item.percentage}%
                    </div>

                </div>

            `).join('');
        }

        const ctx = document.getElementById(
            'analyticsChart'
        );

        if (window.analyticsChartInstance) {
            window.analyticsChartInstance.destroy();
        }

        if (itemsWithPct.length === 0) return;

        window.analyticsChartInstance = new Chart(ctx, {

            type: 'doughnut',

            data: {

                labels: labels,

                datasets: [{

                    data: data,
                    backgroundColor: labels.map(
                        (_, i) => palette[i % palette.length]
                    ),
                    borderColor: 'rgba(255,255,255,0.05)',
                    borderWidth: 2,
                }],
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#fff',
                            padding: 14,
                            font: { size: 12 },
                        },
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const v = ctx.parsed;
                                const pct = grandTotal > 0
                                    ? (v / grandTotal * 100).toFixed(1)
                                    : 0;
                                return `${ctx.label}: $${v.toLocaleString()} (${pct}%)`;
                            },
                        },
                    },
                },
            },
        });

    } catch (error) {

        console.error("Error en renderAnalytics:", error);

        const ranking = document.getElementById('analytics-ranking');
        if (ranking) {
            ranking.innerHTML = `
                <p style="color:#EF4444;">
                    Error cargando analítica. Verificá que el backend esté online.
                </p>
            `;
        }
    }
}

// Clasificar categorias

async function reclassifyCategory(categoryId) {

    const select = document.getElementById(
        `select-${categoryId}`
    );

    const motherCategoryId = select.value;

    try {

        const response = await fetch(

            `${API_BASE_URL}/reclassify-category/${categoryId}?mother_category_id=${motherCategoryId}`,

            {
                method: 'PUT',
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            const errBody = await response.text();
            console.error("Backend respondió error:", response.status, errBody);
            throw new Error(`HTTP ${response.status}: ${errBody}`);
        }

        const updated = await response.json();
        console.log("Categoría actualizada en backend:", updated);

        alert("Categoría actualizada");

        await loadAllData();

        const analyticsSection = document.getElementById('analytics-section');
        if (analyticsSection && analyticsSection.style.display !== 'none') {
            await renderAnalytics();
        }

    } catch (error) {

        console.error(error);

        alert(`Error actualizando categoría: ${error.message}`);
    }
}

// Borrar usuarios
async function deleteUser(userId) {

    const confirmDelete = confirm(
        "¿Seguro que deseas eliminar este usuario?"
    );

    if (!confirmDelete) return;

    try {

        await fetch(

            `${API_BASE_URL}/users/${userId}`,

            {
                method: 'DELETE'
            }
        );

        alert("Usuario eliminado 😎🔥");

        closeDrawer();

        loadAllData();

    } catch (error) {

        console.error(error);

        alert("Error eliminando usuario");
    }
}

// =====================================================
// CLOSE DRAWER
// =====================================================
function closeDrawer() {

    document.getElementById('user-drawer')
        .classList.remove('open');

    document.getElementById('drawer-overlay')
        .classList.remove('open');
}

function goToCategory(categoryId) {

    closeDrawer();

    switchTab('categories');

    setTimeout(() => {

        const select = document.getElementById(
            `select-${categoryId}`
        );

        if (!select) return;

        const card = select.closest('.glass');

        if (!card) return;

        card.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        card.style.transition = '0.4s';

        card.style.boxShadow =
            '0 0 25px rgba(99,102,241,0.9)';

        setTimeout(() => {

            card.style.boxShadow = '';

        }, 3000);

    }, 500);
}

// 
function switchTab(tab) {

    document.querySelectorAll('.content-section')
        .forEach(
            s => s.style.display = 'none'
        );

    document.querySelectorAll('.menu-item')
        .forEach(
            m => m.classList.remove('active')
        );

    document.getElementById(
        `${tab === 'users' ? 'dashboard' : tab}-section`
    ).style.display = 'block';

    event.currentTarget.classList.add('active');

    // ANALYTICS
    if (tab === 'analytics') {

        renderAnalytics();
    }

    // CATEGORIES
    if (tab === 'categories') {

        renderCategories();
    }
}


window.onload = loadAllData;