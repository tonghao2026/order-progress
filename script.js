/**

 * 订单设计进度管理系统 - 交互脚本

 */



// ========== 数据持久化模块 ==========

const DataStore = {

  // 存储键名

  KEYS: {
    ENGINEERS: 'order_progress_engineers',
    ORDERS: 'order_progress_orders',
    PROGRESS_TYPES: 'order_progress_types',
    PROGRESS_DATA: 'order_progress_data',
    CONFIG_GROUPS: 'order_progress_config_groups',
    PRODUCT_TYPES: 'order_progress_product_types'
  },



  // 保存数据

  save(key, data) {

    try {

      localStorage.setItem(key, JSON.stringify(data));

    } catch (e) {

      console.warn('数据保存失败:', e);

    }

  },



  // 加载数据

  load(key, defaultValue = null) {

    try {

      const data = localStorage.getItem(key);

      return data ? JSON.parse(data) : defaultValue;

    } catch (e) {

      console.warn('数据加载失败:', e);

      return defaultValue;

    }

  },



  // 删除数据

  remove(key) {

    try {

      localStorage.removeItem(key);

    } catch (e) {

      console.warn('数据删除失败:', e);

    }

  },



  // 清空所有数据

  clear() {

    Object.values(this.KEYS).forEach(key => {

      this.remove(key);

    });

  }

};



document.addEventListener('DOMContentLoaded', () => {

  // ========== Toast 通知 ==========

  function showToast(message, type = 'success') {

    const existing = document.querySelector('.toast');

    if (existing) existing.remove();



    const toast = document.createElement('div');

    toast.className = `toast toast-${type}`;

    toast.textContent = message;

    document.body.appendChild(toast);



    requestAnimationFrame(() => toast.classList.add('show'));



    setTimeout(() => {

      toast.classList.remove('show');

      setTimeout(() => toast.remove(), 300);

    }, 3000);

  }



  // ========== 主标签页切换 ==========

  const tabBtns = document.querySelectorAll('.tab-btn');

  const tabPanels = document.querySelectorAll('.tab-panel');



  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById('tab-' + btn.dataset.tab);
      if (panel) panel.classList.add('active');
      
      // 切换到计算与预警页时重新加载数据
      if (btn.dataset.tab === 'calc') {
        setTimeout(() => loadCalcPageData(), 50);
      }
      // 切换到进度录入页时刷新订单卡片
      if (btn.dataset.tab === 'progress') {
        setTimeout(() => renderOrderCards(), 50);
      }
    });
  });

  // ========== 进度录入页 ==========
  const engineerCards = document.querySelectorAll('.engineer-card');
  const typeCards = document.querySelectorAll('.type-card');
  const submitBtn = document.getElementById('submitBtn');

  function updateSubmitState() {
    const hasOrder = document.querySelector('.order-card.selected');
    const hasEngineer = document.querySelector('.engineer-card.selected');
    if (submitBtn) {
      submitBtn.disabled = !(hasOrder && hasEngineer);
    }
  }

  // 订单卡片单选 - 使用事件委托（因为订单卡片是动态渲染的）
  const orderGrid = document.getElementById('orderGrid');
  if (orderGrid) {
    orderGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.order-card');
      if (!card) return;
      document.querySelectorAll('.order-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      updateSubmitState();
      // 触发双重确认模块显示/隐藏
      if (typeof updateDoubleConfirmVisibility === 'function') {
        updateDoubleConfirmVisibility();
      }
    });
  }

  // ========== 渲染订单卡片（从 localStorage 动态加载） ==========
  function renderOrderCards() {
    const grid = document.getElementById('orderGrid');
    if (!grid) return;

    const orders = DataStore.load(DataStore.KEYS.ORDERS, []);

    // 清空现有卡片（保留非卡片元素如"更多订单"按钮）
    grid.querySelectorAll('.order-card').forEach(c => c.remove());
    // 清空提示信息
    grid.querySelectorAll('.no-order-tip').forEach(c => c.remove());

    if (orders.length === 0) {
      const tip = document.createElement('div');
      tip.className = 'no-order-tip';
      tip.style.cssText = 'text-align:center;padding:30px;color:#999;grid-column:1/-1;';
      tip.textContent = '暂无订单，请先在「项目信息」中录入订单';
      grid.appendChild(tip);
      return;
    }

    orders.forEach(order => {
      const btn = document.createElement('button');
      btn.className = 'order-card';
      btn.setAttribute('data-order', order.orderNo);
      btn.setAttribute('data-product-type', order.productType || '');
      btn.innerHTML = `
        <span class="order-id">${order.orderNo}</span>
        <span class="order-type">${order.productType || ''}</span>
      `;
      grid.appendChild(btn);
    });
  }

  // 页面加载时渲染订单卡片
  renderOrderCards();



  // 工程师卡片单选

  engineerCards.forEach(card => {

    card.addEventListener('click', () => {

      engineerCards.forEach(c => c.classList.remove('selected'));

      card.classList.add('selected');

      updateSubmitState();

    });

  });



  // 进度类型多选

  typeCards.forEach(card => {

    card.addEventListener('click', () => {

      card.classList.toggle('selected');

    });

  });



  // 提交按钮

  if (submitBtn) {

    submitBtn.addEventListener('click', () => {

      if (submitBtn.disabled) return;

      const selectedOrder = document.querySelector('.order-card.selected');

      const selectedEngineer = document.querySelector('.engineer-card.selected');

      const selectedTypes = document.querySelectorAll('.type-card.selected');



      if (!selectedOrder || !selectedEngineer) {

        showToast('请选择订单和工程师', 'error');

        return;

      }



      // 重置选择
      document.querySelectorAll('.order-card').forEach(c => c.classList.remove('selected'));
      engineerCards.forEach(c => c.classList.remove('selected'));
      typeCards.forEach(c => c.classList.remove('selected'));

      updateSubmitState();



      showToast('进度提交成功！', 'success');

    });

  }



  // "更多订单..."按钮

  const moreOrderBtn = document.getElementById('moreOrders');

  if (moreOrderBtn) {

    moreOrderBtn.addEventListener('click', () => {

      showToast('更多订单功能开发中，敬请期待', 'info');

    });

  }



  // ========== 项目信息页 ==========

  const infoSearch = document.getElementById('infoSearch');

  const infoFilter = document.getElementById('infoFilter');

  const infoTableBody = document.getElementById('infoTableBody');



  function filterInfoTable() {

    if (!infoTableBody) return;

    const keyword = (infoSearch ? infoSearch.value : '').toLowerCase();

    const status = infoFilter ? infoFilter.value : '';



    infoTableBody.querySelectorAll('tr').forEach(row => {

      const orderNo = (row.cells[0]?.textContent || '').toLowerCase();

      const productType = (row.cells[1]?.textContent || '').toLowerCase();

      const rowStatus = row.dataset.status || '';



      const matchKeyword = !keyword || orderNo.includes(keyword) || productType.includes(keyword);

      const matchStatus = !status || rowStatus === status;



      row.style.display = matchKeyword && matchStatus ? '' : 'none';

    });

  }



  if (infoSearch) infoSearch.addEventListener('input', filterInfoTable);

  if (infoFilter) infoFilter.addEventListener('change', filterInfoTable);



  // 项目信息页 - 新增订单按钮

  const addProjectBtn = document.getElementById('addProjectBtn');

  if (addProjectBtn) {

    addProjectBtn.addEventListener('click', () => {

      openModal({ type: 'add', category: 'project', editTarget: null });

    });

  }



  // 项目信息页 - 表格行编辑/删除按钮

  document.querySelectorAll('.row-edit-btn').forEach(btn => {

    btn.addEventListener('click', () => {

      const row = btn.closest('tr');

      if (!row) return;

      openModal({ type: 'edit', category: 'project', editTarget: row });

    });

  });



  document.querySelectorAll('.row-del-btn').forEach(btn => {

    btn.addEventListener('click', () => {

      const row = btn.closest('tr');

      if (row && confirm('确定要删除这条订单记录吗？')) {

        row.remove();

        showToast('删除成功', 'success');

      }

    });

  });



  // ========== 项目信息页 - 智能识别 ==========

  const recTabs = document.querySelectorAll('.rec-tab');

  const recPanels = document.querySelectorAll('.rec-panel');



  recTabs.forEach(tab => {

    tab.addEventListener('click', () => {

      recTabs.forEach(t => t.classList.remove('active'));

      recPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');

      const panel = document.getElementById('rec-' + tab.dataset.rec);

      if (panel) panel.classList.add('active');

    });

  });



  // 产品类型选择

  const productTypeBtns = document.querySelectorAll('.product-type-btn');

  productTypeBtns.forEach(btn => {

    btn.addEventListener('click', () => {

      productTypeBtns.forEach(b => b.classList.remove('selected'));

      btn.classList.add('selected');

    });

  });



  // 数量单选切换

  const quantityRadios = document.querySelectorAll('input[name="quantityType"]');

  const quantityInput = document.getElementById('projectQuantity');

  quantityRadios.forEach(radio => {

    radio.addEventListener('change', () => {

      if (quantityInput) {

        quantityInput.style.display = radio.value === 'manual' ? 'block' : 'none';

      }

    });

  });



  // ========== 产品类型选择 ==========
  // 默认产品类型层级关系（当数据库没有数据时使用）
  const DEFAULT_PRODUCT_TYPES = {
    '环网柜': ['SF6绝缘', '固体绝缘', '环保空气绝缘'],
    '环网箱': ['SF6绝缘', '固体绝缘', '环保空气绝缘'],
    '配电箱': [],
    'GCK': [],
    '中置柜': [],
    '其他': []
  };

  // 一级类型选择
  const level1Grid = document.getElementById('productTypeLevel1');
  const level2Section = document.getElementById('productTypeLevel2Section');
  const level2Grid = document.getElementById('productTypeLevel2');
  const selectedProductTypeInput = document.getElementById('selectedProductType');

  // 从数据库加载产品类型
  function loadProductTypesForForm() {
    const data = DataStore.load(DataStore.KEYS.PRODUCT_TYPES, null);
    const typesMap = {};
    
    if (data && data.length > 0) {
      // 从数据库加载
      data.forEach(group => {
        typesMap[group.name] = (group.children || []).map(child => child.name);
      });
    } else {
      // 使用默认数据
      Object.assign(typesMap, DEFAULT_PRODUCT_TYPES);
    }
    
    return typesMap;
  }

  // 动态渲染一级产品类型按钮
  function renderProductTypeButtons() {
    if (!level1Grid) return;
    const productTypes = loadProductTypesForForm();
    level1Grid.innerHTML = '';
    
    Object.keys(productTypes).forEach(type1 => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'product-type-btn';
      btn.dataset.type = type1;
      btn.textContent = type1;
      level1Grid.appendChild(btn);
    });
  }

  // 页面加载时渲染一级产品类型按钮
  renderProductTypeButtons();

  // 一级类型点击事件 - 使用事件委托
  if (level1Grid) {
    level1Grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.product-type-btn');
      if (!btn) return;

      // 移除其他一级类型的选中状态
      level1Grid.querySelectorAll('.product-type-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      
      const type1 = btn.dataset.type;
      const productTypes = loadProductTypesForForm();
      const level2Types = productTypes[type1] || [];
      
      // 显示/隐藏二级类型
      if (level2Types.length > 0) {
        level2Section.style.display = 'block';
        level2Grid.innerHTML = '';
        
        level2Types.forEach(type2 => {
          const btn2 = document.createElement('button');
          btn2.type = 'button';
          btn2.className = 'product-type-btn';
          btn2.dataset.type = type2;
          btn2.textContent = type2;
          btn2.addEventListener('click', () => {
            level2Grid.querySelectorAll('.product-type-btn').forEach(b => b.classList.remove('selected'));
            btn2.classList.add('selected');
            // 更新隐藏字段
            selectedProductTypeInput.value = `${type1}-${type2}`;
          });
          level2Grid.appendChild(btn2);
        });
      } else {
        level2Section.style.display = 'none';
        level2Grid.innerHTML = '';
      }
      
      // 更新隐藏字段
      selectedProductTypeInput.value = type1;
    });
  }

  // 提交项目信息

  const submitProjectBtn = document.getElementById('submitProjectBtn');

  if (submitProjectBtn) {
    submitProjectBtn.addEventListener('click', () => {
      const orderNo = document.getElementById('projectOrderNo')?.value.trim();
      const productType = document.getElementById('selectedProductType')?.value;
      const orderDate = document.getElementById('projectOrderDate')?.value;
      const designDate = document.getElementById('projectDesignDate')?.value;

      if (!orderNo) {
        showToast('请输入订单编号', 'error');
        return;
      }

      if (!productType) {
        showToast('请选择产品类型', 'error');
        return;
      }

      // 获取数量
      let quantity = '自动';
      const quantityType = document.querySelector('input[name="quantityType"]:checked')?.value;
      if (quantityType === 'manual') {
        const qVal = document.getElementById('projectQuantity')?.value;
        quantity = qVal ? qVal + '台' : '未填写';
      }

      // 保存订单到数据库
      const orders = DataStore.load(DataStore.KEYS.ORDERS, []);
      const newOrder = {
        id: Date.now().toString(),
        orderNo: orderNo,
        productType: productType,
        quantity: quantity,
        orderDate: orderDate,
        designDate: designDate,
        manager: '待分配',
        progress: 0,
        status: 'normal',
        createdAt: new Date().toISOString()
      };
      orders.push(newOrder);
      DataStore.save(DataStore.KEYS.ORDERS, orders);

      // 更新表格显示
      renderOrderTable();
      // 同步刷新进度录入页的订单卡片
      renderOrderCards();
      // 同步刷新管理模块的订单列表
      if (typeof renderOrderManageList === 'function') {
        renderOrderManageList();
      }

      showToast(`项目信息提交成功！\n订单：${orderNo}\n类型：${productType}\n数量：${quantity}`, 'success');

      // 重置表单
      document.getElementById('projectOrderNo').value = '';
      document.getElementById('selectedProductType').value = '';
      document.querySelectorAll('#productTypeLevel1 .product-type-btn').forEach(b => b.classList.remove('selected'));
      if (level2Section) level2Section.style.display = 'none';
      if (level2Grid) level2Grid.innerHTML = '';
      
      const quantityInput = document.getElementById('projectQuantity');
      if (quantityInput) {
        quantityInput.value = '';
        quantityInput.style.display = 'none';
      }
      document.querySelector('input[name="quantityType"][value="auto"]').checked = true;
    });
  }

  // ========== 渲染订单表格 ==========
  function renderOrderTable() {
    const infoTableBody = document.getElementById('infoTableBody');
    if (!infoTableBody) return;
    
    let orders = DataStore.load(DataStore.KEYS.ORDERS, []);
    
    // 数据验证：清理无效数据（旧格式数据没有 id 字段）
    const validOrders = orders.filter(order => order && order.id && order.orderNo);
    if (validOrders.length !== orders.length) {
      console.log('清理了', orders.length - validOrders.length, '条无效订单数据');
      orders = validOrders;
      DataStore.save(DataStore.KEYS.ORDERS, orders);
    }
    
    // 清空表格
    infoTableBody.innerHTML = '';
    
    // 如果没有订单，显示空状态
    if (orders.length === 0) {
      infoTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#999;">暂无订单数据</td></tr>';
      return;
    }
    
    // 渲染每个订单
    orders.forEach(order => {
      const row = document.createElement('tr');
      row.dataset.id = order.id;
      row.dataset.status = order.status || 'normal';
      row.dataset.order = order.orderNo;
      row.dataset.product = order.productType;
      row.dataset.manager = order.manager || '待分配';
      row.dataset.progress = order.progress || 0;
      row.dataset.deadline = order.designDate || '';
      
      const progressBarClass = order.progress >= 80 ? '' : (order.progress >= 50 ? 'bar-warn' : 'bar-danger');
      const statusTag = order.status === 'normal' ? 'tag-normal' : (order.status === 'warn' ? 'tag-warn' : 'tag-danger');
      const statusText = order.status === 'normal' ? '正常' : (order.status === 'warn' ? '预警' : '严重滞后');
      
      row.innerHTML = `
        <td>${order.orderNo}</td>
        <td>${order.productType}</td>
        <td>${order.manager || '待分配'}</td>
        <td><div class="table-progress"><div class="table-progress-bar ${progressBarClass}" style="width:${order.progress || 0}%"></div></div><span>${order.progress || 0}%</span></td>
        <td><span class="tag ${statusTag}">${statusText}</span></td>
        <td>${order.designDate || '-'}</td>
        <td><button class="row-edit-btn" data-id="${order.id}">编辑</button><button class="row-del-btn" data-id="${order.id}">删除</button></td>
      `;
      
      infoTableBody.appendChild(row);
    });
    
    // 绑定删除按钮事件
    infoTableBody.querySelectorAll('.row-del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (confirm('确定要删除这个订单吗？')) {
          deleteOrder(id);
        }
      });
    });
  }
  
  // 删除订单
  function deleteOrder(id) {
    let orders = DataStore.load(DataStore.KEYS.ORDERS, []);
    orders = orders.filter(o => o.id !== id);
    DataStore.save(DataStore.KEYS.ORDERS, orders);
    renderOrderTable();
    renderOrderCards();
    showToast('订单已删除', 'success');
  }
  
  // 页面加载时渲染表格
  renderOrderTable();



  // ========== 管理页 ==========

  const manageTabBtns = document.querySelectorAll('.manage-tab-btn');

  const managePanels = document.querySelectorAll('.manage-panel');



  manageTabBtns.forEach(btn => {

    btn.addEventListener('click', () => {

      manageTabBtns.forEach(b => b.classList.remove('active'));

      managePanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');

      const panel = document.getElementById('manage-' + btn.dataset.manage);

      if (panel) panel.classList.add('active');

    });

  });



  // 管理页搜索

  document.querySelectorAll('.manage-search').forEach(input => {

    input.addEventListener('input', () => {

      const keyword = input.value.toLowerCase();

      const list = input.closest('.manage-panel')?.querySelector('.manage-list');

      if (!list) return;



      list.querySelectorAll('.manage-item').forEach(item => {

        const text = item.textContent.toLowerCase();

        item.style.display = text.includes(keyword) ? '' : 'none';

      });

    });

  });



  // ========== 弹窗功能 ==========

  const modalOverlay = document.getElementById('modalOverlay');

  const modalTitle = document.getElementById('modalTitle');

  const modalBody = document.getElementById('modalBody');

  const modalConfirm = document.getElementById('modalConfirm');

  const modalCancel = document.getElementById('modalCancel');

  const modalClose = document.getElementById('modalClose');



  let currentModalAction = null;



  function openModal(action) {

    currentModalAction = action;

    if (modalTitle) {

      let prefix = '订单';

      if (action.category === 'engineers') prefix = '工程师';

      else if (action.category === 'types') prefix = '进度类型';

      else if (action.category === 'project') prefix = '项目订单';

      modalTitle.textContent = (action.type === 'edit' ? '编辑' : '新增') + prefix;

    }

    if (modalBody) {

      modalBody.innerHTML = generateModalForm(action);

    }

    if (modalOverlay) modalOverlay.classList.add('active');

  }



  function closeModal() {

    if (modalOverlay) modalOverlay.classList.remove('active');

    currentModalAction = null;

  }



  // 获取产品类型列表（一级+二级）
  function getProductTypeOptions() {
    const options = [];
    const tree = document.getElementById('productTypeTree');
    if (tree) {
      tree.querySelectorAll('.product-type-group').forEach(group => {
        const parentName = group.querySelector('.parent-item .type-name')?.textContent || '';
        options.push({ name: parentName, level: 1 });
        group.querySelectorAll('.child-item .type-name').forEach(childName => {
          const name = childName.textContent || '';
          if (name) options.push({ name: name, level: 2, parent: parentName });
        });
      });
    }
    return options;
  }

  // 生成产品类型下拉选择框HTML
  function generateProductTypeSelect(selectedValue, id) {
    const options = getProductTypeOptions();
    let html = `<select id="${id}" class="form-select" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">`;
    html += `<option value="">请选择产品类型</option>`;
    let currentParent = '';
    options.forEach(opt => {
      if (opt.level === 1) {
        if (currentParent) html += '</optgroup>';
        html += `<optgroup label="${opt.name}">`;
        html += `<option value="${opt.name}" ${selectedValue === opt.name ? 'selected' : ''}>${opt.name}</option>`;
        currentParent = opt.name;
      } else {
        html += `<option value="${opt.name}" ${selectedValue === opt.name ? 'selected' : ''}>　${opt.name}</option>`;
      }
    });
    if (currentParent) html += '</optgroup>';
    html += '</select>';
    return html;
  }

  // 生成产品类型勾选框HTML
  function generateProductTypeCheckboxes(selectedValues) {
    const options = getProductTypeOptions();
    const selectedSet = new Set(selectedValues || []);
    let html = '<div class="product-type-checkboxes" style="max-height:200px;overflow-y:auto;display:flex;flex-wrap:wrap;gap:8px;">';
    options.forEach(opt => {
      const checked = selectedSet.has(opt.name) ? 'checked' : '';
      const prefix = opt.level === 2 ? '　' : '';
      html += `<label style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer;${opt.level === 2 ? 'padding-left:12px;' : ''}">
        <input type="checkbox" class="product-type-checkbox" value="${opt.name}" ${checked}> ${prefix}${opt.name}
      </label>`;
    });
    html += '</div>';
    return html;
  }

  function generateModalForm(action) {

    const { type, category, editTarget } = action;

    const isEdit = type === 'edit';



    // 项目信息页 - 订单录入表单

    if (category === 'project') {

      const order = isEdit ? (editTarget?.dataset?.order || '') : '';

      const product = isEdit ? (editTarget?.dataset?.product || '') : '';

      const manager = isEdit ? (editTarget?.dataset?.manager || '') : '';

      const progress = isEdit ? (editTarget?.dataset?.progress || '0') : '0';

      const deadline = isEdit ? (editTarget?.dataset?.deadline || '') : '';

      return `

        <div class="form-group">

          <label>订单号 *</label>

          <input type="text" id="formProjectOrder" value="${order}" placeholder="请输入订单号">

        </div>

        <div class="form-group">
          <label>产品类型 *</label>
          ${generateProductTypeSelect(product, 'formProjectProduct')}
        </div>

        <div class="form-group">

          <label>负责人</label>

          <input type="text" id="formProjectManager" value="${manager}" placeholder="请输入负责人（多个用 / 分隔）">

        </div>

        <div class="form-group">

          <label>进度百分比</label>

          <input type="number" id="formProjectProgress" value="${progress}" min="0" max="100" placeholder="0-100">

        </div>

        <div class="form-group">

          <label>截止日期</label>

          <input type="date" id="formProjectDeadline" value="${deadline}">

        </div>

      `;

    }



    if (category === 'orders') {

      const orderNo = isEdit ? editTarget.querySelector('.order-no')?.textContent || '' : '';

      const productName = isEdit ? editTarget.querySelector('.order-product')?.textContent || '' : '';

      const quantity = isEdit ? (editTarget.dataset.quantity || '') : '';

      const orderDate = isEdit ? (editTarget.dataset.orderDate || '') : '';

      const designDate = isEdit ? (editTarget.dataset.designDate || '') : '';

      return `

        <div class="form-group">

          <label>订单编号</label>

          <input type="text" id="formOrderNo" value="${orderNo}" placeholder="请输入订单编号">

        </div>

        <div class="form-group">
          <label>产品类型</label>
          ${generateProductTypeSelect(productName, 'formProductType')}
        </div>

        <div class="form-group">

          <label>数量</label>

          <input type="number" id="formOrderQuantity" value="${quantity}" placeholder="请输入数量">

        </div>

        <div class="form-group">

          <label>订单下达日期</label>

          <input type="date" id="formOrderDate" value="${orderDate}">

        </div>

        <div class="form-group">

          <label>设计完成日期</label>

          <input type="date" id="formDesignDate" value="${designDate}">

        </div>

      `;

    }

    if (category === 'engineers') {

      const engName = isEdit ? editTarget.querySelector('.eng-name')?.textContent || '' : '';

      const engRole = isEdit ? editTarget.querySelector('.eng-role-tag')?.textContent || '' : '';

      return `

        <div class="form-group">

          <label>工程师姓名</label>

          <input type="text" id="formEngName" value="${engName}" placeholder="请输入姓名">

        </div>

        <div class="form-group">

          <label>专业</label>

          <select id="formEngRole" class="form-select">

            <option value="">请选择专业</option>

            <option value="结构" ${engRole === '结构' ? 'selected' : ''}>结构</option>

            <option value="电气" ${engRole === '电气' ? 'selected' : ''}>电气</option>

          </select>

        </div>

      `;

    }

    // types

    const typeName = isEdit ? editTarget.querySelector('.type-name')?.textContent || '' : '';

    const typeRole = isEdit ? editTarget.dataset.role || '' : '';

    const typeProducts = isEdit ? editTarget.dataset.products || '' : '';
    const typeProductsList = typeProducts ? typeProducts.split('、').filter(s => s) : [];
    return `
      <div class="form-group">
        <label>类型名称</label>
        <input type="text" id="formTypeName" value="${typeName}" placeholder="请输入类型名称">
      </div>
      <div class="form-group">
        <label>适用职能</label>
        <select id="formTypeRole" class="form-select">
          <option value="">请选择</option>
          <option value="电气" ${typeRole === '电气' ? 'selected' : ''}>电气</option>
          <option value="结构" ${typeRole === '结构' ? 'selected' : ''}>结构</option>
          <option value="所有" ${typeRole === '所有' ? 'selected' : ''}>所有</option>
        </select>
      </div>
      <div class="form-group">
        <label>适用产品类型</label>
        ${generateProductTypeCheckboxes(typeProductsList)}
      </div>
    `;

  }



  function handleModalConfirm() {

    if (!currentModalAction) return;



    const { type, category, editTarget } = currentModalAction;



    // 项目信息页 - 订单录入

    if (category === 'project') {

      const order = document.getElementById('formProjectOrder')?.value.trim();

      const product = document.getElementById('formProjectProduct')?.value.trim();

      const manager = document.getElementById('formProjectManager')?.value.trim() || '-';

      const progress = parseInt(document.getElementById('formProjectProgress')?.value) || 0;

      const deadline = document.getElementById('formProjectDeadline')?.value || '-';



      if (!order || !product) {

        showToast('请填写订单号和产品类型', 'error');

        return;

      }



      // 计算状态

      let status = 'normal';

      if (progress < 30) status = 'danger';

      else if (progress < 50) status = 'warn';



      if (type === 'add') {

        addProjectRow(order, product, manager, progress, deadline, status);

        showToast('新增订单成功！', 'success');

      } else {

        updateProjectRow(editTarget, order, product, manager, progress, deadline, status);

        showToast('编辑订单成功！', 'success');

      }

      closeModal();

      return;

    }



    if (category === 'orders') {
      // 订单管理不再支持新增，只能从「项目信息」模块录入
      if (type === 'add') {
        showToast('请从「项目信息」模块录入新订单', 'error');
        closeModal();
        return;
      }

      const orderNo = document.getElementById('formOrderNo')?.value.trim();
      const productType = document.getElementById('formProductType')?.value.trim();
      const quantity = document.getElementById('formOrderQuantity')?.value.trim();
      const orderDate = document.getElementById('formOrderDate')?.value;
      const designDate = document.getElementById('formDesignDate')?.value;

      if (!orderNo || !productType) {
        showToast('请填写订单编号和产品类型', 'error');
        return;
      }

      const orderData = {
        quantity: quantity || '1',
        orderDate: orderDate || new Date().toISOString().split('T')[0],
        designDate: designDate || ''
      };

      // 只支持编辑
      updateManageItem(editTarget, orderNo, productType, orderData);
      showToast('编辑订单成功！', 'success');
      // 保存到 localStorage
      saveManageData();
      // 同步更新进度录入页面的订单列表
      loadEntryPageData();
      // 刷新管理模块列表（带排序）
      if (typeof renderOrderManageList === 'function') {
        renderOrderManageList();
      }
    } else if (category === 'engineers') {
      const engName = document.getElementById('formEngName')?.value.trim();
      const engRole = document.getElementById('formEngRole')?.value.trim();
      if (!engName || !engRole) {
        showToast('请填写完整信息', 'error');
        return;
      }
      if (type === 'add') {
        addManageItem('engManageList', engName, engRole);
        showToast('新增工程师成功！', 'success');
      } else {
        updateManageItem(editTarget, engName, engRole);
        showToast('编辑工程师成功！', 'success');
      }
      // 保存到 localStorage
      saveManageData();
      // 同步更新进度录入页面的工程师列表
      loadEntryPageData();

    } else if (category === 'types') {

      const typeName = document.getElementById('formTypeName')?.value.trim();
      const typeRole = document.getElementById('formTypeRole')?.value.trim();
      const checkedBoxes = document.querySelectorAll('.product-type-checkbox:checked');
      const typeProducts = Array.from(checkedBoxes).map(cb => cb.value).join('、');
      if (!typeName) {

        showToast('请填写类型名称', 'error');

        return;

      }

      const typeData = {

        role: typeRole || '所有',

        products: typeProducts || ''

      };

      if (type === 'add') {
        addManageItem('typeManageList', typeName, typeRole || '所有', typeData);
        showToast('新增类型成功！', 'success');
      } else {
        updateManageItem(editTarget, typeName, typeRole || '所有', typeData);
        showToast('编辑类型成功！', 'success');
      }
      // 保存到 localStorage
      saveManageData();
      // 同步更新进度录入页面的进度类型列表
      loadEntryPageData();
    }

    closeModal();

  }



  function addManageItem(listId, id, name, extraData = null) {
    const list = document.getElementById(listId);
    if (!list) return;

    const isEngTable = listId === 'engManageList';
    const isOrderTable = listId === 'orderManageList';
    const isTypeTable = listId === 'typeManageList';
    const isDraggable = isEngTable || isOrderTable || isTypeTable;

    // 如果是第一个项目，清空"暂无数据"提示
    const existingItems = list.querySelectorAll('.manage-item');
    if (existingItems.length === 0) {
      list.innerHTML = '';
    }

    const itemIndex = existingItems.length + 1;

    

    const item = document.createElement('div');

    

    if (isEngTable) {

      // 工程师表格行格式

      item.className = 'manage-item eng-table-row draggable';

      item.dataset.index = itemIndex;

      item.draggable = true;

      item.dataset.progress = '0';

      const today = new Date();

      const dateStr = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();

      item.dataset.created = dateStr;

      

      item.innerHTML = `

        <span class="eng-sort-arrows"><span class="arrow-up">↑</span><span class="arrow-down">↓</span></span>

        <span class="eng-name">${id}</span>

        <span class="eng-role-tag">${name}</span>

        <span class="eng-progress"><span class="progress-badge">0项</span></span>

        <span class="eng-time">${dateStr}</span>

        <span class="eng-actions">

          <button class="icon-btn edit-btn" title="编辑">✏️</button>

          <button class="icon-btn del-btn" title="删除">🗑️</button>

        </span>

      `;

    } else if (isOrderTable) {

      // 订单表格行格式

      item.className = 'manage-item order-table-row draggable';

      item.dataset.index = itemIndex;

      item.draggable = true;

      const qty = extraData?.quantity || '1';

      const oDate = extraData?.orderDate || '';

      const dDate = extraData?.designDate || '';
      const progress = parseInt(extraData?.progress) || 0;
      const progressTotal = 10;
      const progressDone = Math.round(progress * progressTotal / 100);

      item.dataset.quantity = qty;
      item.dataset.orderDate = oDate;
      item.dataset.designDate = dDate;
      item.dataset.progressDone = progressDone.toString();
      item.dataset.progressTotal = progressTotal.toString();

      item.innerHTML = `
        <span class="order-sort-arrows"><span class="arrow-up">↑</span><span class="arrow-down">↓</span></span>
        <span class="order-no">${id}</span>
        <span class="order-product">${name}</span>
        <span class="order-qty">${qty}</span>
        <span class="order-progress"><div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${progress}%"></div></div><span class="progress-text">${progressDone}/${progressTotal}</span></span>
        <span class="order-date">${oDate}</span>
        <span class="order-delivery">${dDate}</span>
        <span class="order-actions"><button class="icon-btn edit-btn" title="编辑">✏️</button><button class="icon-btn del-btn" title="删除">🗑️</button></span>
      `;

    } else if (isTypeTable) {

      // 进度类型表格行格式

      item.className = 'manage-item type-table-row draggable';

      item.dataset.index = itemIndex;

      item.draggable = true;

      const role = name || '所有';

      const products = extraData?.products || '';

      item.dataset.role = role;

      item.dataset.products = products;

      const today = new Date();

      const dateStr = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();

      item.dataset.created = dateStr;

      

      // 根据职能选择标签样式

      let roleClass = 'role-all';

      if (role === '电气') roleClass = 'role-elec';

      else if (role === '结构') roleClass = 'role-struct';

      

      item.innerHTML = `

        <span class="type-sort-arrows"><span class="arrow-up">↑</span><span class="arrow-down">↓</span></span>

        <span class="type-name">${id}</span>

        <span class="type-role"><span class="role-tag ${roleClass}">${role}</span></span>

        <span class="type-products">${products}</span>

        <span class="type-time">${dateStr}</span>

        <span class="type-actions"><button class="icon-btn setting-btn" title="设置">⚙️</button><button class="icon-btn edit-btn" title="编辑">✏️</button><button class="icon-btn del-btn" title="删除">🗑️</button></span>

      `;

    } else {

      // 通用列表项格式

      item.className = 'manage-item' + (isDraggable ? ' draggable' : '');

      item.dataset.index = itemIndex;

      if (isDraggable) item.draggable = true;

      

      // 如果有额外数据（订单），保存到dataset

      if (listId === 'orderManageList' && extraData) {

        item.dataset.quantity = extraData.quantity || '';

        item.dataset.orderDate = extraData.orderDate || '';

        item.dataset.designDate = extraData.designDate || '';

      }

      

      const dragHandle = isDraggable ? '<span class="drag-handle">☰</span>' : '';

      const indexBadge = isDraggable ? `<span class="item-index">${itemIndex}</span>` : '';

      

      item.innerHTML = `

        ${dragHandle}${indexBadge}

        <div class="manage-item-info">

          <span class="manage-item-id">${id}</span>

          <span class="manage-item-name">${name}</span>

        </div>

        <div class="manage-item-actions">

          <button class="action-btn edit-btn">编辑</button>

          <button class="action-btn del-btn">删除</button>

        </div>

      `;

    }



    // 绑定编辑按钮

    item.querySelector('.edit-btn').addEventListener('click', () => {

      let category = 'types';

      if (listId === 'orderManageList') category = 'orders';

      else if (listId === 'engManageList') category = 'engineers';

      else if (listId === 'manage-products') category = 'products';

      else if (listId === 'manage-confirm') category = 'confirm';

      openModal({ type: 'edit', category, editTarget: item });

    });



    // 绑定删除按钮
    item.querySelector('.del-btn').addEventListener('click', () => {
      if (confirm('确定要删除这条记录吗？')) {
        item.remove();
        if (isDraggable) updateItemIndexes(listId);
        // 保存到 localStorage
        saveManageData();
        // 同步更新进度录入页面的列表
        loadEntryPageData();
        showToast('删除成功', 'success');
      }
    });

    

    // 绑定设置按钮（进度类型配置）

    const settingBtn = item.querySelector('.setting-btn');

    if (settingBtn) {

      settingBtn.addEventListener('click', (e) => {

        e.stopPropagation();

        const typeName = item.querySelector('.type-name')?.textContent || '';

        openProductConfig(typeName, item);

      });

    }

    

    // 绑定拖拽事件

    if (isDraggable) {

      item.addEventListener('dragstart', handleDragStart);

      item.addEventListener('dragend', handleDragEnd);

      item.addEventListener('dragover', handleDragOver);

      item.addEventListener('drop', handleDrop);

    }



    list.appendChild(item);

    

    // 保存到 localStorage

    saveManageData();

  }



  function updateManageItem(item, id, name, extraData = {}) {

    // 工程师表格行格式

    if (item.classList.contains('eng-table-row')) {

      const nameEl = item.querySelector('.eng-name');

      const roleEl = item.querySelector('.eng-role-tag');

      if (nameEl) nameEl.textContent = id;

      if (roleEl) roleEl.textContent = name;

      return;

    }

    

    // 订单表格行格式

    if (item.classList.contains('order-table-row')) {

      const noEl = item.querySelector('.order-no');

      const prodEl = item.querySelector('.order-product');

      const qtyEl = item.querySelector('.order-qty');

      const dateEl = item.querySelector('.order-date');

      const delEl = item.querySelector('.order-delivery');

      if (noEl) noEl.textContent = id;

      if (prodEl) prodEl.textContent = name;

      if (qtyEl && extraData.quantity !== undefined) qtyEl.textContent = extraData.quantity;

      if (dateEl && extraData.orderDate !== undefined) dateEl.textContent = extraData.orderDate;

      if (delEl && extraData.designDate !== undefined) delEl.textContent = extraData.designDate;

      if (extraData.quantity !== undefined) item.dataset.quantity = extraData.quantity;

      if (extraData.orderDate !== undefined) item.dataset.orderDate = extraData.orderDate;

      if (extraData.designDate !== undefined) item.dataset.designDate = extraData.designDate;

      // 保存到 localStorage

      saveManageData();

      return;

    }

    

    // 进度类型表格行格式

    if (item.classList.contains('type-table-row')) {

      const nameEl = item.querySelector('.type-name');

      const roleEl = item.querySelector('.type-role');

      const productsEl = item.querySelector('.type-products');

      if (nameEl) nameEl.textContent = id;

      if (roleEl) {

        const role = name || '所有';

        let roleClass = 'role-all';

        if (role === '电气') roleClass = 'role-elec';

        else if (role === '结构') roleClass = 'role-struct';

        roleEl.innerHTML = `<span class="role-tag ${roleClass}">${role}</span>`;

      }

      if (productsEl && extraData.products !== undefined) productsEl.textContent = extraData.products;

      if (extraData.role !== undefined) item.dataset.role = extraData.role;

      if (extraData.products !== undefined) item.dataset.products = extraData.products;

      return;

    }

    

    // 通用列表项格式

    const idEl = item.querySelector('.manage-item-id');

    const nameEl = item.querySelector('.manage-item-name');

    if (idEl) idEl.textContent = id;

    if (nameEl) nameEl.textContent = name;

  }



  // 项目信息页 - 新增表格行

  function addProjectRow(order, product, manager, progress, deadline, status) {

    const tbody = document.getElementById('infoTableBody');

    if (!tbody) return;



    const row = document.createElement('tr');

    row.dataset.status = status;

    row.dataset.order = order;

    row.dataset.product = product;

    row.dataset.manager = manager;

    row.dataset.progress = progress;

    row.dataset.deadline = deadline;



    // 确定进度条和标签样式

    let barClass = '';

    let tagClass = 'tag-normal';

    let tagText = '正常';

    if (status === 'danger') {

      barClass = 'bar-danger';

      tagClass = 'tag-danger';

      tagText = '严重滞后';

    } else if (status === 'warn') {

      barClass = 'bar-warn';

      tagClass = 'tag-warn';

      tagText = '预警';

    }



    row.innerHTML = `

      <td>${order}</td>

      <td>${product}</td>

      <td>${manager}</td>

      <td><div class="table-progress"><div class="table-progress-bar ${barClass}" style="width:${progress}%"></div></div><span>${progress}%</span></td>

      <td><span class="tag ${tagClass}">${tagText}</span></td>

      <td>${deadline}</td>

      <td><button class="row-edit-btn">编辑</button><button class="row-del-btn">删除</button></td>

    `;



    // 绑定编辑按钮

    row.querySelector('.row-edit-btn').addEventListener('click', () => {

      openModal({ type: 'edit', category: 'project', editTarget: row });

    });



    // 绑定删除按钮

    row.querySelector('.row-del-btn').addEventListener('click', () => {

      if (confirm('确定要删除这条订单记录吗？')) {

        row.remove();

        showToast('删除成功', 'success');

      }

    });



    tbody.appendChild(row);

  }



  // 项目信息页 - 更新表格行

  function updateProjectRow(row, order, product, manager, progress, deadline, status) {

    if (!row) return;



    row.dataset.order = order;

    row.dataset.product = product;

    row.dataset.manager = manager;

    row.dataset.progress = progress;

    row.dataset.deadline = deadline;

    row.dataset.status = status;



    // 确定进度条和标签样式

    let barClass = '';

    let tagClass = 'tag-normal';

    let tagText = '正常';

    if (status === 'danger') {

      barClass = 'bar-danger';

      tagClass = 'tag-danger';

      tagText = '严重滞后';

    } else if (status === 'warn') {

      barClass = 'bar-warn';

      tagClass = 'tag-warn';

      tagText = '预警';

    }



    // 更新单元格内容

    row.cells[0].textContent = order;

    row.cells[1].textContent = product;

    row.cells[2].textContent = manager;

    row.cells[3].innerHTML = `<div class="table-progress"><div class="table-progress-bar ${barClass}" style="width:${progress}%"></div></div><span>${progress}%</span>`;

    row.cells[4].innerHTML = `<span class="tag ${tagClass}">${tagText}</span>`;

    row.cells[5].textContent = deadline;

  }



  // 弹窗按钮事件

  if (modalConfirm) modalConfirm.addEventListener('click', handleModalConfirm);

  if (modalCancel) modalCancel.addEventListener('click', closeModal);

  if (modalClose) modalClose.addEventListener('click', closeModal);

  if (modalOverlay) {

    modalOverlay.addEventListener('click', (e) => {

      if (e.target === modalOverlay) closeModal();

    });

  }



  // 管理页新增按钮
  // 订单管理不再提供新增功能，订单只能从「项目信息」模块录入

  // 订单排序功能
  const orderSortField = document.getElementById('orderSortField');
  const orderSortDirection = document.getElementById('orderSortDirection');

  if (orderSortField && orderSortDirection) {
    // 排序字段改变
    orderSortField.addEventListener('change', () => {
      renderOrderManageList();
    });

    // 排序方向切换
    orderSortDirection.addEventListener('click', () => {
      const currentDir = orderSortDirection.dataset.direction;
      const newDir = currentDir === 'asc' ? 'desc' : 'asc';
      orderSortDirection.dataset.direction = newDir;
      orderSortDirection.innerHTML = `<span class="sort-icon">${newDir === 'asc' ? '↑' : '↓'}</span> ${newDir === 'asc' ? '升序' : '降序'}`;
      renderOrderManageList();
    });
  }

  // 渲染订单管理列表（带排序）
  function renderOrderManageList() {
    const orderList = document.getElementById('orderManageList');
    if (!orderList) return;

    let orders = DataStore.load(DataStore.KEYS.ORDERS, []);
    if (orders.length === 0) {
      orderList.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">暂无订单，请先在「项目信息」中录入订单</div>';
      return;
    }

    // 获取排序参数
    const sortField = orderSortField?.value || 'createdAt';
    const sortDirection = orderSortDirection?.dataset.direction || 'desc';

    // 排序
    orders = [...orders].sort((a, b) => {
      let valA, valB;

      switch (sortField) {
        case 'createdAt':
          valA = new Date(a.createdAt || 0).getTime();
          valB = new Date(b.createdAt || 0).getTime();
          break;
        case 'designDate':
          valA = a.designDate ? new Date(a.designDate).getTime() : 0;
          valB = b.designDate ? new Date(b.designDate).getTime() : 0;
          break;
        case 'progress':
          valA = parseInt(a.progress) || 0;
          valB = parseInt(b.progress) || 0;
          break;
        default:
          valA = new Date(a.createdAt || 0).getTime();
          valB = new Date(b.createdAt || 0).getTime();
      }

      if (sortDirection === 'asc') {
        return valA - valB;
      } else {
        return valB - valA;
      }
    });

    // 清空并重新渲染
    orderList.innerHTML = '';
    orders.forEach(order => {
      addManageItem('orderManageList', order.orderNo, order.productType, {
        quantity: order.quantity,
        orderDate: order.orderDate,
        designDate: order.designDate,
        progress: order.progress
      });
    });
  }

  document.getElementById('addEngBtn')?.addEventListener('click', () => {

    openModal({ type: 'add', category: 'engineers', editTarget: null });

  });

  document.getElementById('addTypeBtn')?.addEventListener('click', () => {

    openModal({ type: 'add', category: 'types', editTarget: null });

  });

  document.getElementById('addProductBtn')?.addEventListener('click', () => {

    openModal({ type: 'add', category: 'products', editTarget: null });

  });



  // 管理页编辑按钮（已有行）

  document.querySelectorAll('.edit-btn').forEach(btn => {

    btn.addEventListener('click', () => {

      const item = btn.closest('.manage-item');

      const panel = btn.closest('.manage-panel');

      if (!item || !panel) return;



      let category = 'types';

      if (panel.id === 'manage-orders') category = 'orders';

      else if (panel.id === 'manage-engineers') category = 'engineers';

      else if (panel.id === 'manage-products') category = 'products';

      else if (panel.id === 'manage-confirm') category = 'confirm';

      openModal({ type: 'edit', category, editTarget: item });

    });

  });



  // 管理页删除按钮（已有行）

  document.querySelectorAll('.del-btn').forEach(btn => {

    btn.addEventListener('click', () => {

      const item = btn.closest('.manage-item');

      if (item && confirm('确定要删除这条记录吗？')) {

        item.remove();

        updateItemIndexes('engManageList');

        showToast('删除成功', 'success');

      }

    });

  });



  // ========== 拖拽排序功能 ==========

  function initDragAndDrop() {

    const lists = ['engManageList', 'orderManageList', 'typeManageList'];

    

    lists.forEach(listId => {

      const list = document.getElementById(listId);

      if (!list) return;

      

      const items = list.querySelectorAll('.manage-item');

      

      items.forEach(item => {

        item.addEventListener('dragstart', handleDragStart);

        item.addEventListener('dragend', handleDragEnd);

        item.addEventListener('dragover', handleDragOver);

        item.addEventListener('drop', handleDrop);

        

        // 工程师表格行的上下箭头排序

        const arrowUp = item.querySelector('.arrow-up');

        const arrowDown = item.querySelector('.arrow-down');

        if (arrowUp) {

          arrowUp.addEventListener('click', (e) => {

            e.stopPropagation();

            const prev = item.previousElementSibling;

            if (prev && prev.classList.contains('manage-item')) {

              list.insertBefore(item, prev);

              updateItemIndexes(listId);

              showToast('顺序已上移', 'success');

            }

          });

        }

        if (arrowDown) {

          arrowDown.addEventListener('click', (e) => {

            e.stopPropagation();

            const next = item.nextElementSibling;

            if (next && next.classList.contains('manage-item')) {

              list.insertBefore(next, item);

              updateItemIndexes(listId);

              showToast('顺序已下移', 'success');

            }

          });

        }

      });

    });

  }



  let draggedItem = null;



  function handleDragStart(e) {

    draggedItem = this;

    this.classList.add('dragging');

    e.dataTransfer.effectAllowed = 'move';

  }



  function handleDragEnd(e) {

    this.classList.remove('dragging');

    draggedItem = null;

  }



  function handleDragOver(e) {

    e.preventDefault();

    e.dataTransfer.dropEffect = 'move';

  }



  function handleDrop(e) {

    e.preventDefault();

    if (this !== draggedItem) {

      const list = this.parentNode;

      const allItems = [...list.querySelectorAll('.manage-item')];

      const draggedIndex = allItems.indexOf(draggedItem);

      const droppedIndex = allItems.indexOf(this);

      

      if (draggedIndex < droppedIndex) {

        list.insertBefore(draggedItem, this.nextSibling);

      } else {

        list.insertBefore(draggedItem, this);

      }

      

      updateItemIndexes(list.id);

      showToast('顺序已更新', 'success');

    }

  }



  function updateItemIndexes(listId) {

    const list = document.getElementById(listId);

    if (!list) return;

    

    const items = list.querySelectorAll('.manage-item');

    items.forEach((item, index) => {

      item.dataset.index = index + 1;

      const indexEl = item.querySelector('.item-index');

      if (indexEl) {

        indexEl.textContent = index + 1;

      }

    });

  }



  // ========== 配置适用产品类型弹窗 ==========

  const productConfigOverlay = document.getElementById('productConfigOverlay');

  const productConfigClose = document.getElementById('productConfigClose');

  const productConfigCancel = document.getElementById('productConfigCancel');

  const productConfigSave = document.getElementById('productConfigSave');

  const selectAllBtn = document.getElementById('selectAllBtn');

  const deselectAllBtn = document.getElementById('deselectAllBtn');

  const selectedCountEl = document.getElementById('selectedCount');

  const configTypeNameEl = document.getElementById('configTypeName');

  let currentConfigTarget = null;



  // 打开配置弹窗

  function openProductConfig(typeName, targetItem) {

    currentConfigTarget = targetItem;

    if (configTypeNameEl) configTypeNameEl.textContent = typeName;

    if (productConfigOverlay) productConfigOverlay.classList.add('active');

    updateSelectedCount();

  }



  // 关闭配置弹窗

  function closeProductConfig() {

    if (productConfigOverlay) productConfigOverlay.classList.remove('active');

    currentConfigTarget = null;

  }



  // 更新选中计数

  function updateSelectedCount() {

    const allCheckboxes = document.querySelectorAll('#productTree input[type="checkbox"]');

    const checked = document.querySelectorAll('#productTree input[type="checkbox"]:checked');

    if (selectedCountEl) {

      selectedCountEl.textContent = `已选择 ${checked.length} / ${allCheckboxes.length} 个产品类型`;

    }

    // 更新父节点的计数

    document.querySelectorAll('.tree-parent input[data-children]').forEach(parentCb => {

      const childrenIds = parentCb.dataset.children.split(',');

      const childCheckboxes = childrenIds.map(id => document.getElementById(id)).filter(cb => cb);

      const checkedCount = childCheckboxes.filter(cb => cb.checked).length;

      const countEl = parentCb.parentElement.querySelector('.tree-count');

      if (countEl) {

        countEl.textContent = `(${checkedCount}/${childCheckboxes.length})`;

      }

    });

  }



  // 全选

  if (selectAllBtn) {

    selectAllBtn.addEventListener('click', () => {

      document.querySelectorAll('#productTree input[type="checkbox"]').forEach(cb => {

        cb.checked = true;

      });

      updateSelectedCount();

    });

  }



  // 取消全选

  if (deselectAllBtn) {

    deselectAllBtn.addEventListener('click', (e) => {

      e.preventDefault();

      document.querySelectorAll('#productTree input[type="checkbox"]').forEach(cb => {

        cb.checked = false;

      });

      updateSelectedCount();

    });

  }



  // 父节点联动子节点

  document.querySelectorAll('.tree-parent input[data-children]').forEach(parentCb => {

    parentCb.addEventListener('change', () => {

      const childrenIds = parentCb.dataset.children.split(',');

      childrenIds.forEach(id => {

        const childCb = document.getElementById(id);

        if (childCb) childCb.checked = parentCb.checked;

      });

      updateSelectedCount();

    });

  });



  // 子节点联动父节点

  document.querySelectorAll('.tree-child input[type="checkbox"]').forEach(childCb => {

    childCb.addEventListener('change', () => {

      // 找到对应的父节点

      const parentCb = document.querySelector(`.tree-parent input[data-children*="${childCb.id}"]`);

      if (parentCb) {

        const childrenIds = parentCb.dataset.children.split(',');

        const allChecked = childrenIds.every(id => {

          const cb = document.getElementById(id);

          return cb && cb.checked;

        });

        parentCb.checked = allChecked;

      }

      updateSelectedCount();

    });

  });



  // 关闭按钮

  if (productConfigClose) productConfigClose.addEventListener('click', closeProductConfig);

  if (productConfigCancel) productConfigCancel.addEventListener('click', closeProductConfig);

  if (productConfigOverlay) {

    productConfigOverlay.addEventListener('click', (e) => {

      if (e.target === productConfigOverlay) closeProductConfig();

    });

  }



  // 保存按钮

  if (productConfigSave) {

    productConfigSave.addEventListener('click', () => {

      const checkedLabels = [];

      document.querySelectorAll('#productTree input[type="checkbox"]:checked').forEach(cb => {

        const label = cb.nextElementSibling;

        if (label && label.tagName === 'LABEL') {

          checkedLabels.push(label.textContent);

        }

      });

      if (currentConfigTarget) {

        currentConfigTarget.dataset.products = checkedLabels.join('、');

        const productsEl = currentConfigTarget.querySelector('.type-products');

        if (productsEl) productsEl.textContent = checkedLabels.join('、');

      }

      showToast('配置已保存', 'success');

      closeProductConfig();

    });

  }



  // 绑定设置按钮点击事件（在addManageItem中动态添加的元素也需要绑定）

  function bindSettingButtons() {

    document.querySelectorAll('.type-table-row .setting-btn').forEach(btn => {

      if (!btn.dataset.bound) {

        btn.dataset.bound = 'true';

        btn.addEventListener('click', (e) => {

          e.stopPropagation();

          const row = btn.closest('.type-table-row');

          const typeName = row?.querySelector('.type-name')?.textContent || '';

          openProductConfig(typeName, row);

        });

      }

    });

  }

  bindSettingButtons();



  // ========== 产品类型管理功能 ==========

  const productTypeTree = document.getElementById('productTypeTree');

  

  // 展开/收起功能

  if (productTypeTree) {

    productTypeTree.addEventListener('click', (e) => {

      const expandIcon = e.target.closest('.expand-icon');

      if (expandIcon) {

        const group = expandIcon.closest('.product-type-group');

        const children = group.querySelector('.product-children');

        if (children) {

          const isExpanded = group.classList.contains('expanded');

          if (isExpanded) {

            group.classList.remove('expanded');

            expandIcon.textContent = '▶';

            children.style.display = 'none';

          } else {

            group.classList.add('expanded');

            expandIcon.textContent = '▼';

            children.style.display = 'block';

          }

        }

      }

    });

  }



  // 产品类型排序功能

  document.querySelectorAll('.product-type-group').forEach(group => {

    const sortUpBtn = group.querySelector('.parent-item .sort-up');

    const sortDownBtn = group.querySelector('.parent-item .sort-down');

    

    if (sortUpBtn) {
      sortUpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const prevGroup = group.previousElementSibling;
        if (prevGroup && prevGroup.classList.contains('product-type-group')) {
          productTypeTree.insertBefore(group, prevGroup);
          saveProductTypes();
          showToast('顺序已上移', 'success');
        }
      });
    }
    
    if (sortDownBtn) {
      sortDownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextGroup = group.nextElementSibling;
        if (nextGroup && nextGroup.classList.contains('product-type-group')) {
          productTypeTree.insertBefore(nextGroup, group);
          saveProductTypes();
          showToast('顺序已下移', 'success');
        }
      });
    }
  });



  // 二级分类排序功能

  document.querySelectorAll('.product-children').forEach(childrenContainer => {

    const childItems = childrenContainer.querySelectorAll('.child-item');

    childItems.forEach((item, index) => {

      const sortUpBtn = item.querySelector('.sort-up');

      const sortDownBtn = item.querySelector('.sort-down');

      

      if (sortUpBtn) {

        sortUpBtn.addEventListener('click', (e) => {

          e.stopPropagation();

          const prevItem = item.previousElementSibling;

          if (prevItem && prevItem.classList.contains('child-item')) {

            childrenContainer.insertBefore(item, prevItem);

            showToast('顺序已上移', 'success');

          }

        });

      }

      

      if (sortDownBtn) {

        sortDownBtn.addEventListener('click', (e) => {

          e.stopPropagation();

          const nextItem = item.nextElementSibling;

          if (nextItem && nextItem.classList.contains('child-item')) {

            childrenContainer.insertBefore(nextItem, item);

            showToast('顺序已下移', 'success');

          }

        });

      }

    });

  });



  // 添加二级分类功能

  document.querySelectorAll('.add-child').forEach(btn => {

    btn.addEventListener('click', (e) => {

      e.stopPropagation();

      const group = btn.closest('.product-type-group');

      const parentName = group.querySelector('.parent-item .type-name')?.textContent || '';

      const childrenContainer = group.querySelector('.product-children');

      

      // 展开父级

      if (!group.classList.contains('expanded')) {

        group.classList.add('expanded');

        group.querySelector('.expand-icon').textContent = '▼';

        childrenContainer.style.display = 'block';

      }

      

      // 创建新的二级分类项

      const newChild = document.createElement('div');

      newChild.className = 'product-type-item child-item';

      newChild.innerHTML = `

        <span class="level-tag level-2">二级</span>

        <span class="type-name">新分类</span>

        <span class="type-parent">(${parentName})</span>

        <span class="type-actions">

          <button class="icon-btn sort-up" title="上移">↑</button>

          <button class="icon-btn sort-down" title="下移">↓</button>

          <button class="icon-btn move-btn" title="变更所属"><</button>

          <button class="icon-btn edit-btn" title="编辑">✏️</button>

          <button class="icon-btn del-btn" title="删除">🗑️</button>

        </span>

      `;

      

      childrenContainer.appendChild(newChild);

      

      // 绑定新项的事件

      bindChildItemEvents(newChild, childrenContainer);

      bindProductEditButtons();

      

      showToast('已添加二级分类，请编辑名称', 'success');

    });

  });



  // 绑定二级分类项事件

  function bindChildItemEvents(item, container) {
    // 上移
    item.querySelector('.sort-up')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const prevItem = item.previousElementSibling;
      if (prevItem && prevItem.classList.contains('child-item')) {
        container.insertBefore(item, prevItem);
        saveProductTypes();
        showToast('顺序已上移', 'success');
      }
    });
    
    // 下移
    item.querySelector('.sort-down')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const nextItem = item.nextElementSibling;
      if (nextItem && nextItem.classList.contains('child-item')) {
        container.insertBefore(nextItem, item);
        saveProductTypes();
        showToast('顺序已下移', 'success');
      }
    });
    
    // 删除
    item.querySelector('.del-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('确定要删除这个二级分类吗？')) {
        item.remove();
        saveProductTypes();
        showToast('删除成功', 'success');
      }
    });
    
    // 变更所属
    item.querySelector('.move-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const typeName = item.querySelector('.type-name')?.textContent || '';
      openMoveCategoryModal(typeName, item);
    });
  }



  // 绑定所有现有二级分类的事件

  document.querySelectorAll('.child-item').forEach(item => {

    const container = item.closest('.product-children');

    bindChildItemEvents(item, container);

  });



  // 新增一级类型按钮

  const addTopProductBtn = document.getElementById('addTopProductBtn');

  if (addTopProductBtn && productTypeTree) {

    addTopProductBtn.addEventListener('click', () => {

      const newGroup = document.createElement('div');

      newGroup.className = 'product-type-group expanded';

      newGroup.innerHTML = `

        <div class="product-type-item parent-item">

          <span class="expand-icon">▼</span>

          <span class="level-tag level-1">一级</span>

          <span class="type-name">新产品类型</span>

          <span class="type-actions">

            <button class="icon-btn sort-up" title="上移">↑</button>

            <button class="icon-btn sort-down" title="下移">↓</button>

            <button class="icon-btn add-child" title="添加二级">+</button>

            <button class="icon-btn edit-btn" title="编辑">✏️</button>

            <button class="icon-btn del-btn" title="删除">🗑️</button>

          </span>

        </div>

        <div class="product-children">

        </div>

      `;

      

      productTypeTree.appendChild(newGroup);
      
      // 绑定新组的事件
      bindGroupEvents(newGroup);
      bindProductEditButtons();
      
      // 保存到 localStorage
      saveProductTypes();
      
      showToast('已添加一级类型，请编辑名称', 'success');
    });
  }



  // 绑定产品类型组事件

  function bindGroupEvents(group) {

    // 展开/收起

    

    // 添加二级分类

    const addChildBtn = group.querySelector('.add-child');

    if (addChildBtn) {

      addChildBtn.addEventListener('click', (e) => {

        e.stopPropagation();

        const parentName = group.querySelector('.parent-item .type-name')?.textContent || '';

        const childrenContainer = group.querySelector('.product-children');

        

        if (!group.classList.contains('expanded')) {

          group.classList.add('expanded');

          group.querySelector('.expand-icon').textContent = '▼';

          childrenContainer.style.display = 'block';

        }

        

        const newChild = document.createElement('div');

        newChild.className = 'product-type-item child-item';

        newChild.innerHTML = `

          <span class="level-tag level-2">二级</span>

          <span class="type-name">新分类</span>

          <span class="type-parent">(${parentName})</span>

          <span class="type-actions">

            <button class="icon-btn sort-up" title="上移">↑</button>

            <button class="icon-btn sort-down" title="下移">↓</button>

            <button class="icon-btn move-btn" title="变更所属"><</button>

            <button class="icon-btn edit-btn" title="编辑">✏️</button>

            <button class="icon-btn del-btn" title="删除">🗑️</button>

          </span>

        `;

        

        childrenContainer.appendChild(newChild);
        bindChildItemEvents(newChild, childrenContainer);
        bindProductEditButtons();
        
        // 保存到 localStorage
        saveProductTypes();
        
        showToast('已添加二级分类，请编辑名称', 'success');
      });
    }

    

    // 删除按钮

    const delBtn = group.querySelector('.parent-item .del-btn');

    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('确定要删除这个产品类型及其所有二级分类吗？')) {
          group.remove();
          
          // 保存到 localStorage
          saveProductTypes();
          
          showToast('删除成功', 'success');
        }
      });
    }
  }



  // ========== 变更所属分类弹窗功能 ==========

  const moveCategoryOverlay = document.getElementById('moveCategoryOverlay');

  const moveCategoryClose = document.getElementById('moveCategoryClose');

  const moveCategoryCancel = document.getElementById('moveCategoryCancel');

  const moveCategoryConfirm = document.getElementById('moveCategoryConfirm');

  const moveItemNameEl = document.getElementById('moveItemName');

  const targetCategorySelect = document.getElementById('targetCategorySelect');

  let currentMoveItem = null;



  // 打开变更所属弹窗

  function openMoveCategoryModal(itemName, itemElement) {

    currentMoveItem = itemElement;

    if (moveItemNameEl) moveItemNameEl.textContent = itemName;

    if (targetCategorySelect) targetCategorySelect.value = '';

    if (moveCategoryOverlay) moveCategoryOverlay.classList.add('active');

  }



  // 关闭变更所属弹窗

  function closeMoveCategoryModal() {

    if (moveCategoryOverlay) moveCategoryOverlay.classList.remove('active');

    currentMoveItem = null;

  }



  // 关闭按钮事件

  if (moveCategoryClose) moveCategoryClose.addEventListener('click', closeMoveCategoryModal);

  if (moveCategoryCancel) moveCategoryCancel.addEventListener('click', closeMoveCategoryModal);

  if (moveCategoryOverlay) {

    moveCategoryOverlay.addEventListener('click', (e) => {

      if (e.target === moveCategoryOverlay) closeMoveCategoryModal();

    });

  }



  // 确认移动

  if (moveCategoryConfirm) {

    moveCategoryConfirm.addEventListener('click', () => {

      const targetCategory = targetCategorySelect?.value;

      if (!targetCategory) {

        showToast('请选择目标分类', 'error');

        return;

      }

      

      if (currentMoveItem) {

        // 更新父级名称显示

        const parentEl = currentMoveItem.querySelector('.type-parent');

        if (parentEl) parentEl.textContent = `(${targetCategory})`;

        

        // 找到目标一级分类的children容器

        let targetContainer = null;

        document.querySelectorAll('.product-type-group').forEach(group => {

          const parentName = group.querySelector('.parent-item .type-name')?.textContent;

          if (parentName === targetCategory) {

            targetContainer = group.querySelector('.product-children');

            // 展开目标组

            if (!group.classList.contains('expanded')) {

              group.classList.add('expanded');

              group.querySelector('.expand-icon').textContent = '▼';

              targetContainer.style.display = 'block';

            }

          }

        });

        

        if (targetContainer) {
          targetContainer.appendChild(currentMoveItem);
          saveProductTypes();
          showToast('分类已变更', 'success');
          closeMoveCategoryModal();
        } else {
          showToast('未找到目标分类', 'error');
        }
      }
    });
  }



  // ========== 编辑产品类型弹窗功能 ==========

  const editProductTypeOverlay = document.getElementById('editProductTypeOverlay');

  const editProductTypeClose = document.getElementById('editProductTypeClose');

  const editProductTypeCancel = document.getElementById('editProductTypeCancel');

  const editProductTypeSave = document.getElementById('editProductTypeSave');

  const editProductTypeNameInput = document.getElementById('editProductTypeName');

  let currentEditProductItem = null;



  // 打开编辑弹窗

  function openEditProductTypeModal(itemElement) {

    currentEditProductItem = itemElement;

    const currentName = itemElement.querySelector('.type-name')?.textContent || '';

    if (editProductTypeNameInput) editProductTypeNameInput.value = currentName;

    if (editProductTypeOverlay) editProductTypeOverlay.classList.add('active');

    // 聚焦输入框

    setTimeout(() => {

      if (editProductTypeNameInput) editProductTypeNameInput.focus();

    }, 100);

  }



  // 关闭编辑弹窗

  function closeEditProductTypeModal() {

    if (editProductTypeOverlay) editProductTypeOverlay.classList.remove('active');

    currentEditProductItem = null;

  }



  // 关闭按钮事件

  if (editProductTypeClose) editProductTypeClose.addEventListener('click', closeEditProductTypeModal);

  if (editProductTypeCancel) editProductTypeCancel.addEventListener('click', closeEditProductTypeModal);

  if (editProductTypeOverlay) {

    editProductTypeOverlay.addEventListener('click', (e) => {

      if (e.target === editProductTypeOverlay) closeEditProductTypeModal();

    });

  }



  // 保存按钮
  if (editProductTypeSave) {
    editProductTypeSave.addEventListener('click', () => {
      const newName = editProductTypeNameInput?.value.trim();
      if (!newName) {
        showToast('请输入产品类型名称', 'error');
        return;
      }
      if (currentEditProductItem) {
        const nameEl = currentEditProductItem.querySelector('.type-name');
        if (nameEl) nameEl.textContent = newName;
        
        // 保存到 localStorage
        saveProductTypes();
        
        showToast('修改成功', 'success');
        closeEditProductTypeModal();
      }
    });
  }



  // 回车保存

  if (editProductTypeNameInput) {

    editProductTypeNameInput.addEventListener('keydown', (e) => {

      if (e.key === 'Enter') {

        editProductTypeSave?.click();

      }

    });

  }



  // 绑定所有产品类型的编辑按钮

  function bindProductEditButtons() {

    // 一级类型的编辑按钮

    document.querySelectorAll('.parent-item .edit-btn').forEach(btn => {

      if (!btn.dataset.bound) {

        btn.dataset.bound = 'true';

        btn.addEventListener('click', (e) => {

          e.stopPropagation();

          const item = btn.closest('.product-type-item');

          openEditProductTypeModal(item);

        });

      }

    });

    // 二级类型的编辑按钮

    document.querySelectorAll('.child-item .edit-btn').forEach(btn => {

      if (!btn.dataset.bound) {

        btn.dataset.bound = 'true';

        btn.addEventListener('click', (e) => {

          e.stopPropagation();

          const item = btn.closest('.product-type-item');

          openEditProductTypeModal(item);

        });

      }

    });

  }

  bindProductEditButtons();



  // ========== 双重确认管理-设置适用产品类型弹窗 ==========

  const confirmProductConfigOverlay = document.getElementById('confirmProductConfigOverlay');

  const confirmProductConfigClose = document.getElementById('confirmProductConfigClose');

  const confirmProductConfigCancel = document.getElementById('confirmProductConfigCancel');

  const confirmProductConfigSave = document.getElementById('confirmProductConfigSave');



  function openConfirmProductConfig() {

    if (confirmProductConfigOverlay) confirmProductConfigOverlay.classList.add('active');

    initConfirmProductTree();

  }



  function closeConfirmProductConfig() {

    if (confirmProductConfigOverlay) confirmProductConfigOverlay.classList.remove('active');

  }



  // 初始化产品树状态

  function initConfirmProductTree() {

    // 环网柜默认选中2/3

    document.getElementById('cc1-2').checked = true;

    document.getElementById('cc1-3').checked = true;

    updateParentState('cp1', ['cc1-1', 'cc1-2', 'cc1-3']);

    // 环网箱默认选中2/3

    document.getElementById('cc2-2').checked = true;

    document.getElementById('cc2-3').checked = true;

    updateParentState('cp2', ['cc2-1', 'cc2-2', 'cc2-3']);

  }



  // 更新父级状态和计数

  function updateParentState(parentId, childIds) {

    const parentCb = document.getElementById(parentId);

    if (!parentCb) return;

    const countEl = document.getElementById('count-' + parentId);

    let checkedCount = 0;

    childIds.forEach(id => {

      const cb = document.getElementById(id);

      if (cb && cb.checked) checkedCount++;

    });

    if (countEl) countEl.textContent = `${checkedCount}/${childIds.length}`;

    parentCb.checked = checkedCount === childIds.length;

  }



  // 关闭按钮

  if (confirmProductConfigClose) confirmProductConfigClose.addEventListener('click', closeConfirmProductConfig);

  if (confirmProductConfigCancel) confirmProductConfigCancel.addEventListener('click', closeConfirmProductConfig);

  if (confirmProductConfigOverlay) {

    confirmProductConfigOverlay.addEventListener('click', (e) => {

      if (e.target === confirmProductConfigOverlay) closeConfirmProductConfig();

    });

  }



  // 保存按钮

  if (confirmProductConfigSave) {

    confirmProductConfigSave.addEventListener('click', () => {

      showToast('配置已保存', 'success');

      closeConfirmProductConfig();

    });

  }



  // 父级复选框点击

  document.querySelectorAll('.cproduct-parent .parent-cb').forEach(parentCb => {

    parentCb.addEventListener('change', () => {

      const parentDiv = parentCb.closest('.cproduct-parent');

      const childrenDiv = parentDiv?.nextElementSibling;

      if (childrenDiv && childrenDiv.classList.contains('cproduct-children')) {

        const childCbs = childrenDiv.querySelectorAll('input[type="checkbox"]');

        childCbs.forEach(cb => {

          cb.checked = parentCb.checked;

        });

        const childIds = Array.from(childCbs).map(cb => cb.id);

        updateParentState(parentCb.id, childIds);

      }

    });

  });



  // 子级复选框点击

  document.querySelectorAll('.cproduct-child input').forEach(childCb => {

    childCb.addEventListener('change', () => {

      const childrenDiv = childCb.closest('.cproduct-children');

      if (childrenDiv) {

        const parentDiv = childrenDiv.previousElementSibling;

        const parentCb = parentDiv?.querySelector('input[type="checkbox"]');

        if (parentCb) {

          const childCbs = childrenDiv.querySelectorAll('input[type="checkbox"]');

          const childIds = Array.from(childCbs).map(cb => cb.id);

          updateParentState(parentCb.id, childIds);

        }

      }

    });

  });



  // ========== 双重确认管理功能 ==========

  // 新增配置弹窗

  const addConfirmConfigOverlay = document.getElementById('addConfirmConfigOverlay');

  const addConfirmConfigClose = document.getElementById('addConfirmConfigClose');

  const addConfirmConfigCancel = document.getElementById('addConfirmConfigCancel');

  const addConfirmConfigSubmit = document.getElementById('addConfirmConfigSubmit');



  function openAddConfirmConfig() {

    if (addConfirmConfigOverlay) addConfirmConfigOverlay.classList.add('active');

    // 清空表单

    const nameInput = document.getElementById('confirmConfigName');

    const groupInput = document.getElementById('confirmConfigGroupName');

    if (nameInput) nameInput.value = '';

    if (groupInput) groupInput.value = '';

    document.getElementById('confirmConfigEngineerType').value = '通用';

    document.getElementById('confirmConfigSelectMode').value = '二选一/多选一';

  }



  function closeAddConfirmConfig() {

    if (addConfirmConfigOverlay) addConfirmConfigOverlay.classList.remove('active');

  }



  // 新增配置按钮

  const addConfirmConfigBtn = document.getElementById('addConfirmConfigBtn');

  if (addConfirmConfigBtn) {

    addConfirmConfigBtn.addEventListener('click', openAddConfirmConfig);

  }



  // 关闭按钮

  if (addConfirmConfigClose) addConfirmConfigClose.addEventListener('click', closeAddConfirmConfig);

  if (addConfirmConfigCancel) addConfirmConfigCancel.addEventListener('click', closeAddConfirmConfig);

  if (addConfirmConfigOverlay) {

    addConfirmConfigOverlay.addEventListener('click', (e) => {

      if (e.target === addConfirmConfigOverlay) closeAddConfirmConfig();

    });

  }



  // 提交新增配置

  if (addConfirmConfigSubmit) {

    addConfirmConfigSubmit.addEventListener('click', () => {

      const name = document.getElementById('confirmConfigName')?.value.trim();

      const engineerType = document.getElementById('confirmConfigEngineerType')?.value || '通用';

      const selectMode = document.getElementById('confirmConfigSelectMode')?.value || '二选一/多选一';

      const groupName = document.getElementById('confirmConfigGroupName')?.value.trim();



      if (!name) {

        showToast('请输入配置名称', 'error');

        return;

      }



      // 查找或创建分组

      let targetGroup = null;

      const groups = document.querySelectorAll('.confirm-group');

      

      if (groupName) {

        // 查找同名分组

        groups.forEach(g => {

          const gName = g.querySelector('.group-name')?.textContent;

          if (gName === groupName) {

            targetGroup = g;

          }

        });

        // 没找到则创建新分组

        if (!targetGroup) {

          targetGroup = createConfirmGroup(groupName);

          document.getElementById('confirmGroups').appendChild(targetGroup);

        }

      } else {

        // 没有分组名称，添加到第一个分组或创建新分组

        if (groups.length > 0) {

          targetGroup = groups[0];

        } else {

          targetGroup = createConfirmGroup('默认分组');

          document.getElementById('confirmGroups').appendChild(targetGroup);

        }

      }



      // 添加配置行

      const tbody = targetGroup.querySelector('.confirm-table-body');

      const newRow = document.createElement('div');

      newRow.className = 'confirm-row';

      newRow.innerHTML = `

        <span class="confirm-sort"><span class="sort-arrows">⇅</span></span>

        <span class="confirm-name">${name}</span>

        <span class="confirm-type"><span class="type-tag-neutral">${engineerType}</span></span>

        <span class="confirm-mode"><span class="mode-tag">${selectMode}</span></span>

        <span class="confirm-actions"><a class="action-link" href="javascript:;">设置</a><button class="icon-btn del-btn" title="删除">🗑️</button></span>

      `;

      tbody.appendChild(newRow);



      // 绑定事件

      bindConfirmRowEvents(newRow, tbody);



      // 更新分组计数

      updateGroupCount(targetGroup);



      // 保存到 localStorage

      saveConfigGroups();



      showToast('添加成功', 'success');

      closeAddConfirmConfig();

    });

  }



  // 保存配置分组数据到 localStorage

  function saveConfigGroups() {

    const groups = document.querySelectorAll('.confirm-group');

    const data = [];

    groups.forEach(group => {

      const groupName = group.querySelector('.group-name')?.textContent || '';

      const rows = group.querySelectorAll('.confirm-row');

      const items = [];

      rows.forEach(row => {

        items.push({

          name: row.querySelector('.confirm-name')?.textContent || '',

          type: row.querySelector('.type-tag-neutral')?.textContent || '',

          mode: row.querySelector('.mode-tag')?.textContent || ''

        });

      });

      data.push({ groupName, items });

    });

    DataStore.save(DataStore.KEYS.CONFIG_GROUPS, data);

  }



  // 从 localStorage 加载配置分组数据
  function loadConfigGroups() {
    const data = DataStore.load(DataStore.KEYS.CONFIG_GROUPS, null);
    const container = document.getElementById('confirmGroups');
    if (!container) return;
    
    // 如果没有保存的数据，保留HTML中的默认示例数据
    if (!data || data.length === 0) {
      // 绑定现有行的事件
      container.querySelectorAll('.confirm-row').forEach(row => {
        const tbody = row.closest('.confirm-table-body');
        if (tbody) bindConfirmRowEvents(row, tbody);
      });
      // 更新分组计数
      container.querySelectorAll('.confirm-group').forEach(group => {
        updateGroupCount(group);
      });
      return;
    }
    
    container.innerHTML = '';

    data.forEach(groupData => {

      if (groupData.items && groupData.items.length > 0) {

        const group = createConfirmGroup(groupData.groupName);

        const tbody = group.querySelector('.confirm-table-body');

        groupData.items.forEach(item => {

          const row = document.createElement('div');

          row.className = 'confirm-row';

          row.innerHTML = `

            <span class="confirm-sort"><span class="sort-arrows">⇅</span></span>

            <span class="confirm-name">${item.name}</span>

            <span class="confirm-type"><span class="type-tag-neutral">${item.type}</span></span>

            <span class="confirm-mode"><span class="mode-tag">${item.mode}</span></span>

            <span class="confirm-actions"><a class="action-link" href="javascript:;">设置</a><button class="icon-btn del-btn" title="删除">🗑️</button></span>

          `;

          tbody.appendChild(row);

          bindConfirmRowEvents(row, tbody);

        });

        updateGroupCount(group);

        container.appendChild(group);

      }

    });

  }



  // 页面加载时恢复数据

  loadConfigGroups();



  // 创建新分组

  function createConfirmGroup(groupName) {

    const group = document.createElement('div');

    group.className = 'confirm-group';

    group.innerHTML = `

      <div class="confirm-group-header">

        <span class="group-name">${groupName}</span>

        <span class="group-count">0个配置</span>

      </div>

      <div class="confirm-table-header">

        <span class="confirm-col-sort">排序</span>

        <span class="confirm-col-name">配置名称</span>

        <span class="confirm-col-type">适用类型</span>

        <span class="confirm-col-mode">选择方式</span>

        <span class="confirm-col-action">产品类型</span>

      </div>

      <div class="confirm-table-body"></div>

    `;

    return group;

  }



  // 更新分组计数

  function updateGroupCount(group) {

    const count = group.querySelector('.group-count');

    const rowCount = group.querySelectorAll('.confirm-row').length;

    if (count) count.textContent = `${rowCount}个配置`;

  }



  // 绑定配置行事件

  function bindConfirmRowEvents(row, tbody) {

    // 删除

    row.querySelector('.del-btn')?.addEventListener('click', (e) => {

      e.stopPropagation();

      if (confirm('确定要删除这条配置吗？')) {

        const group = row.closest('.confirm-group');

        row.remove();

        updateGroupCount(group);

        // 保存到 localStorage

        saveConfigGroups();

        showToast('删除成功', 'success');

      }

    });

    // 设置

    row.querySelector('.action-link')?.addEventListener('click', (e) => {

      e.preventDefault();

      openConfirmProductConfig();

    });

    // 排序
    row.querySelector('.sort-arrows')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = e.target.getBoundingClientRect();
      const isUp = e.clientY < rect.top + rect.height / 2;
      if (isUp) {
        const prevRow = row.previousElementSibling;
        if (prevRow && prevRow.classList.contains('confirm-row')) {
          tbody.insertBefore(row, prevRow);
          saveConfigGroups();
          showToast('顺序已上移', 'success');
        }
      } else {
        const nextRow = row.nextElementSibling;
        if (nextRow && nextRow.classList.contains('confirm-row')) {
          tbody.insertBefore(nextRow, row);
          saveConfigGroups();
          showToast('顺序已下移', 'success');
        }
      }
    });
  }



  // 删除配置行
  document.querySelectorAll('.confirm-row .del-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const row = btn.closest('.confirm-row');
      if (row && confirm('确定要删除这条配置吗？')) {
        const body = row.closest('.confirm-table-body');
        row.remove();
        // 更新分组计数
        if (body) {
          const group = body.closest('.confirm-group');
          const count = group?.querySelector('.group-count');
          if (count) {
            const rowCount = body.querySelectorAll('.confirm-row').length;
            count.textContent = `${rowCount}个配置`;
          }
        }
        // 保存到 localStorage
        saveConfigGroups();
        showToast('删除成功', 'success');
      }
    });
  });



  // 设置链接点击

  document.querySelectorAll('.action-link').forEach(link => {

    link.addEventListener('click', (e) => {

      e.preventDefault();

      openConfirmProductConfig();

    });

  });



  // 排序功能
  document.querySelectorAll('.confirm-table-body').forEach(body => {
    const rows = body.querySelectorAll('.confirm-row');
    rows.forEach((row, index) => {
      const sortArrows = row.querySelector('.sort-arrows');
      if (sortArrows) {
        sortArrows.addEventListener('click', (e) => {
          e.stopPropagation();
          // 点击上半部分上移，下半部分下移
          const rect = sortArrows.getBoundingClientRect();
          const isUp = e.clientY < rect.top + rect.height / 2;
          if (isUp) {
            const prevRow = row.previousElementSibling;
            if (prevRow && prevRow.classList.contains('confirm-row')) {
              body.insertBefore(row, prevRow);
              saveConfigGroups();
              showToast('顺序已上移', 'success');
            }
          } else {
            const nextRow = row.nextElementSibling;
            if (nextRow && nextRow.classList.contains('confirm-row')) {
              body.insertBefore(nextRow, row);
              saveConfigGroups();
              showToast('顺序已下移', 'success');
            }
          }
        });
      }
    });
  });



  // ========== 初始化 ==========
  updateSubmitState();
  initDragAndDrop();

  // ========== 从localStorage加载数据到进度录入页面 ==========
  function loadEntryPageData() {
    // 加载工程师 - 总是从数据库加载，如果没有数据则保留HTML默认数据
    const engineers = DataStore.load(DataStore.KEYS.ENGINEERS, []);
    const engineerGrid = document.getElementById('engineerGrid');
    if (engineerGrid) {
      if (engineers.length > 0) {
        // 有数据，替换HTML内容
        engineerGrid.innerHTML = '';
        engineers.forEach(eng => {
          const btn = document.createElement('button');
          btn.className = 'engineer-card';
          btn.setAttribute('data-engineer', eng.name);
          btn.innerHTML = `
            <span class="eng-name">${eng.name}</span>
            <span class="eng-role">${eng.role}</span>
          `;
          btn.addEventListener('click', () => {
            document.querySelectorAll('.engineer-card').forEach(c => c.classList.remove('selected'));
            btn.classList.add('selected');
            updateSubmitState();
            updateDoubleConfirmVisibility();
          });
          engineerGrid.appendChild(btn);
        });
      } else {
        // 没有数据，给HTML中的默认按钮绑定事件
        engineerGrid.querySelectorAll('.engineer-card').forEach(btn => {
          btn.addEventListener('click', () => {
            document.querySelectorAll('.engineer-card').forEach(c => c.classList.remove('selected'));
            btn.classList.add('selected');
            updateSubmitState();
            updateDoubleConfirmVisibility();
          });
        });
      }
    }

    // 加载订单 - 从 localStorage 动态渲染（由 renderOrderCards 函数处理）
    renderOrderCards();

    // 加载进度类型 - 总是从数据库加载，如果没有数据则保留HTML默认数据
    const types = DataStore.load(DataStore.KEYS.PROGRESS_TYPES, []);
    const typeGrid = document.getElementById('typeGrid');
    if (typeGrid) {
      if (types.length > 0) {
        // 有数据，替换HTML内容
        typeGrid.innerHTML = '';
        types.forEach(type => {
          const btn = document.createElement('button');
          btn.className = 'type-card';
          btn.setAttribute('data-type', type.name);
          btn.textContent = type.name;
          btn.addEventListener('click', () => {
            btn.classList.toggle('selected');
            updateDoubleConfirmVisibility();
          });
          typeGrid.appendChild(btn);
        });
      } else {
        // 没有数据，给HTML中的默认按钮绑定事件
        typeGrid.querySelectorAll('.type-card').forEach(btn => {
          btn.addEventListener('click', () => {
            btn.classList.toggle('selected');
            updateDoubleConfirmVisibility();
          });
        });
      }
    }

    // 加载产品类型按钮（项目信息页面）
    const productTypeOptions = getProductTypeOptions();
    const productTypeGrid = document.getElementById('productTypeGrid');
    if (productTypeGrid && productTypeOptions.length > 0) {
      productTypeGrid.innerHTML = '';
      productTypeOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'product-type-btn';
        btn.setAttribute('data-type', opt.name);
        btn.textContent = opt.name;
        if (opt.level === 2) {
          btn.style.paddingLeft = '16px';
          btn.style.fontSize = '13px';
        }
        btn.addEventListener('click', () => {
          document.querySelectorAll('.product-type-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
        productTypeGrid.appendChild(btn);
      });
    }
  }

  // 页面加载时恢复进度录入页面数据
  loadEntryPageData();

  // ========== 双重确认模块 ==========
  // 定义需要双重确认的产品类型
  const DOUBLE_CONFIRM_PRODUCT_TYPES = ['固体绝缘', '环保空气绝缘'];
  
  // 更新双重确认模块的显示/隐藏
  function updateDoubleConfirmVisibility() {
    const doubleConfirmSection = document.getElementById('doubleConfirmSection');
    const doubleConfirmContent = document.getElementById('doubleConfirmContent');
    if (!doubleConfirmSection || !doubleConfirmContent) return;
    
    // 获取当前选中的订单
    const selectedOrder = document.querySelector('.order-card.selected');
    const productType = selectedOrder?.dataset.productType || '';
    
    // 检查是否需要显示双重确认
    const needsDoubleConfirm = DOUBLE_CONFIRM_PRODUCT_TYPES.some(type => 
      productType.includes(type)
    );
    
    if (needsDoubleConfirm) {
      doubleConfirmSection.style.display = 'block';
      renderDoubleConfirmItems();
    } else {
      doubleConfirmSection.style.display = 'none';
      doubleConfirmContent.innerHTML = '';
    }
  }
  
  // 渲染双重确认项（卡片式下拉选择）
  function renderDoubleConfirmItems() {
    const doubleConfirmContent = document.getElementById('doubleConfirmContent');
    if (!doubleConfirmContent) return;
    
    // 从双重确认管理获取配置
    const configGroups = DataStore.load(DataStore.KEYS.CONFIG_GROUPS, []);
    
    // 如果没有配置，使用默认配置
    const groups = configGroups.length > 0 ? configGroups : [
      {
        name: '隔离方式',
        selectionType: 'single', // 单选
        items: ['上隔离', '下隔离']
      },
      {
        name: '户外箱外观',
        selectionType: 'single',
        items: ['标准型', '中国风(镂空雕花)', '简约型', '其他']
      }
    ];
    
    // 获取当前选中的工程师
    const selectedEngineer = document.querySelector('.engineer-card.selected');
    const engineerRole = selectedEngineer?.querySelector('.eng-role')?.textContent || '';
    const roleName = engineerRole === '结构' ? '结构工程师' : (engineerRole === '电气' ? '电气工程师' : '工程师');
    
    // 构建HTML
    let html = `
      <div class="double-confirm-header">
        <div class="double-confirm-title">重要配置双重确认</div>
        <div class="double-confirm-role">由${roleName}填写</div>
      </div>
      <div class="double-confirm-tag">二选一/多选一</div>
      <div class="double-confirm-grid">
    `;
    
    groups.forEach(group => {
      const items = group.items || [];
      const selectionType = group.selectionType || 'single';
      
      html += `
        <div class="double-confirm-card">
          <div class="double-confirm-card-label">${group.name}</div>
          <select class="double-confirm-card-select" data-group="${group.name}" data-type="${selectionType}">
            <option value="">请选择</option>
      `;
      
      items.forEach(item => {
        if (typeof item === 'string') {
          html += `<option value="${item}">${item}</option>`;
        } else if (item.name) {
          html += `<option value="${item.name}">${item.name}</option>`;
        }
      });
      
      html += `
          </select>
        </div>
      `;
    });
    
    html += '</div>';
    
    doubleConfirmContent.innerHTML = html;
  }

  // ========== 计算与预警页面数据加载 ==========
  function loadCalcPageData() {
    const container = document.getElementById('projectCardsContainer');
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    // 从项目信息表格中获取订单列表
    const infoTableBody = document.getElementById('infoTableBody');
    const tableRows = infoTableBody ? infoTableBody.querySelectorAll('tr') : [];
    
    // 从管理数据中获取进度类型列表
    const progressTypes = DataStore.load(DataStore.KEYS.PROGRESS_TYPES, []);
    
    // 获取进度数据
    const progressData = DataStore.load(DataStore.KEYS.PROGRESS_DATA, {});
    
    // 统计计数
    let totalCount = 0;
    let normalCount = 0;
    let warnCount = 0;
    let dangerCount = 0;
    
    // 如果没有订单，显示空状态
    if (!tableRows || tableRows.length === 0) {
      container.innerHTML = '<div class="empty-state" style="text-align:center;padding:40px;color:#999;">暂无项目数据</div>';
      updateCalcStats(0, 0, 0, 0);
      return;
    }
    
    // 遍历每个订单生成卡片
    tableRows.forEach(row => {
      const orderNo = row.cells[0]?.textContent || '';
      const productType = row.cells[1]?.textContent || '';
      const quantity = row.dataset.quantity || '1';
      const designDate = row.dataset.deadline || '';
      
      // 获取该订单的进度数据
      const orderProgress = progressData[orderNo] || {};
      
      // 计算进度
      const completedTypes = [];
      let completedCount = 0;
      const totalTypes = progressTypes.length > 0 ? progressTypes.length : 10; // 默认10项
      const progressPercent = totalTypes > 0 ? Math.round((completedCount / totalTypes) * 100) : 0;
      
      // 遍历进度类型，检查哪些已完成
      progressTypes.forEach(type => {
        if (orderProgress[type.name]) {
          completedTypes.push(type.name);
          completedCount++;
        }
      });
      
      // 计算状态
      let status = 'normal';
      const today = new Date();
      let daysLeft = null;
      let alertMessage = '';
      
      if (designDate) {
        const deadline = new Date(designDate);
        const diffTime = deadline - today;
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (daysLeft < 0) {
          // 已延期
          status = 'danger';
          alertMessage = `项目已延期! 请在 ${designDate} 前完成所有进度`;
        } else if (daysLeft <= 7) {
          // 7天内到期
          status = 'danger';
          alertMessage = `距截止日期仅剩 ${daysLeft} 天，请尽快完成`;
        } else if (daysLeft <= 14) {
          // 14天内到期
          status = 'warn';
          alertMessage = `距截止日期仅剩 ${daysLeft} 天，请关注进度`;
        } else if (progressPercent < 50) {
          // 进度落后
          status = 'warn';
          alertMessage = `整体进度 ${progressPercent}%，建议加快进度`;
        }
      } else {
        // 无截止日期，根据进度判断
        if (progressPercent < 30) {
          status = 'warn';
          alertMessage = `整体进度 ${progressPercent}%，进度偏慢`;
        }
      }
      
      // 更新统计
      totalCount++;
      if (status === 'normal') normalCount++;
      else if (status === 'warn') warnCount++;
      else if (status === 'danger') dangerCount++;
      
      // 生成卡片HTML
      const card = document.createElement('div');
      card.className = `project-card status-${status}`;
      
      // 生成类型按钮
      let typeButtonsHtml = '';
      if (progressTypes.length > 0) {
        progressTypes.forEach(type => {
          const isCompleted = completedTypes.includes(type.name);
          typeButtonsHtml += `
            <button class="type-btn ${isCompleted ? 'completed' : ''}">
              ${type.name}
              <span class="type-dot"></span>
            </button>
          `;
        });
      } else {
        // 默认10项
        const defaultTypes = ['一次电气', '气箱', '二次电气(一次设备)', '二次电气', '钣金(一次设备)', 'DTU电气', '户外箱', 'DTU钣金', '电缆附件规格', '其他'];
        defaultTypes.forEach(typeName => {
          const isCompleted = completedTypes.includes(typeName);
          typeButtonsHtml += `
            <button class="type-btn ${isCompleted ? 'completed' : ''}">
              ${typeName}
              <span class="type-dot"></span>
            </button>
          `;
        });
      }
      
      card.innerHTML = `
        <div class="project-alert-banner">
          <span class="alert-icon">⚠️</span>
          <span class="alert-text">${alertMessage}</span>
        </div>
        <div class="project-card-header">
          <div class="project-card-info">
            <div class="project-card-title">${orderNo} ${productType}</div>
            <div class="project-card-meta">
              <span>数量: ${quantity}</span>
              ${designDate ? `<span>设计完成日期: ${designDate}</span>` : ''}
            </div>
          </div>
          <div class="project-card-progress">
            <div class="project-card-progress-num">${progressPercent}%</div>
            <div class="project-card-progress-label">${completedCount}/${totalTypes} 项已完成</div>
          </div>
        </div>
        <div class="type-grid">
          ${typeButtonsHtml}
        </div>
        <div class="project-progress-bar">
          <div class="project-progress-fill" style="width: ${progressPercent}%"></div>
        </div>
      `;
      
      container.appendChild(card);
    });
    
    // 更新统计数字
    updateCalcStats(totalCount, normalCount, warnCount, dangerCount);
  }
  
  // 更新统计数字
  function updateCalcStats(total, normal, warn, danger) {
    const statTotal = document.getElementById('stat-total');
    const statNormal = document.getElementById('stat-normal');
    const statWarn = document.getElementById('stat-warn');
    const statDanger = document.getElementById('stat-danger');
    
    if (statTotal) statTotal.textContent = total;
    if (statNormal) statNormal.textContent = normal;
    if (statWarn) statWarn.textContent = warn;
    if (statDanger) statDanger.textContent = danger;
  }

  // 页面加载时生成计算与预警卡片
  loadCalcPageData();

  // ========== 管理数据持久化 ==========

  function saveManageData() {

    const data = {

      engineers: [],

      orders: [],

      types: []

    };

    

    // 保存工程师

    document.querySelectorAll('#engManageList .manage-item').forEach(item => {

      data.engineers.push({

        name: item.querySelector('.eng-name')?.textContent || '',

        role: item.querySelector('.eng-role-tag')?.textContent || '',

        progress: item.dataset.progress || '0',

        created: item.dataset.created || ''

      });

    });

    

    // 保存订单

    document.querySelectorAll('#orderManageList .manage-item').forEach(item => {

      data.orders.push({

        orderNo: item.querySelector('.order-no')?.textContent || '',

        productType: item.querySelector('.order-product')?.textContent || '',

        quantity: item.dataset.quantity || '',

        orderDate: item.dataset.orderDate || '',

        designDate: item.dataset.designDate || '',

        progressDone: item.dataset.progressDone || '0',

        progressTotal: item.dataset.progressTotal || '10'

      });

    });

    

    // 保存类型

    document.querySelectorAll('#typeManageList .manage-item').forEach(item => {

      data.types.push({

        name: item.querySelector('.type-name')?.textContent || '',

        role: item.dataset.role || '所有',

        products: item.dataset.products || '',

        created: item.dataset.created || ''

      });

    });

    

    DataStore.save(DataStore.KEYS.ENGINEERS, data.engineers);

    DataStore.save(DataStore.KEYS.ORDERS, data.orders);

    DataStore.save(DataStore.KEYS.PROGRESS_TYPES, data.types);

  }



  function loadManageData() {

    const engineers = DataStore.load(DataStore.KEYS.ENGINEERS, []);

    const orders = DataStore.load(DataStore.KEYS.ORDERS, []);

    const types = DataStore.load(DataStore.KEYS.PROGRESS_TYPES, []);

    

    // 恢复工程师

    const engList = document.getElementById('engManageList');

    if (engList && engineers.length > 0) {

      engList.innerHTML = '';

      engineers.forEach(eng => {

        addManageItem('engManageList', eng.name, eng.role);

      });

    }

    

    // 恢复订单 - 使用带排序功能的渲染函数
    if (typeof renderOrderManageList === 'function') {
      renderOrderManageList();
    }

    

    // 恢复类型

    const typeList = document.getElementById('typeManageList');

    if (typeList && types.length > 0) {

      typeList.innerHTML = '';

      types.forEach(type => {

        addManageItem('typeManageList', type.name, type.role, {

          products: type.products

        });

      });

    }

  }



  // 页面加载时恢复管理数据
  loadManageData();

  // ========== 产品类型数据持久化 ==========
  function saveProductTypes() {
    const data = [];
    const productTypeTree = document.getElementById('productTypeTree');
    if (!productTypeTree) return;
    
    productTypeTree.querySelectorAll('.product-type-group').forEach(group => {
      const parentItem = group.querySelector('.parent-item');
      const parentName = parentItem?.querySelector('.type-name')?.textContent || '';
      const isExpanded = group.classList.contains('expanded');
      const children = [];
      
      group.querySelectorAll('.child-item').forEach(child => {
        children.push({
          name: child.querySelector('.type-name')?.textContent || ''
        });
      });
      
      data.push({
        name: parentName,
        expanded: isExpanded,
        children: children
      });
    });
    
    DataStore.save(DataStore.KEYS.PRODUCT_TYPES, data);
    // 同步刷新项目信息模块的一级产品类型按钮
    if (typeof renderProductTypeButtons === 'function') {
      renderProductTypeButtons();
    }
  }

  function loadProductTypes() {
    const data = DataStore.load(DataStore.KEYS.PRODUCT_TYPES, null);
    const productTypeTree = document.getElementById('productTypeTree');
    if (!productTypeTree || !data || data.length === 0) return;
    
    // 清空现有内容
    productTypeTree.innerHTML = '';
    
    // 重建产品类型树
    data.forEach(groupData => {
      const group = document.createElement('div');
      group.className = 'product-type-group' + (groupData.expanded ? ' expanded' : '');
      group.innerHTML = `
        <div class="product-type-item parent-item">
          <span class="expand-icon">${groupData.expanded ? '▼' : '▶'}</span>
          <span class="level-tag level-1">一级</span>
          <span class="type-name">${groupData.name}</span>
          <span class="type-actions">
            <button class="icon-btn sort-up" title="上移">↑</button>
            <button class="icon-btn sort-down" title="下移">↓</button>
            <button class="icon-btn add-child" title="添加二级">+</button>
            <button class="icon-btn edit-btn" title="编辑">✏️</button>
            <button class="icon-btn del-btn" title="删除">🗑️</button>
          </span>
        </div>
        <div class="product-children" style="display: ${groupData.expanded ? 'block' : 'none'}">
        </div>
      `;
      
      const childrenContainer = group.querySelector('.product-children');
      if (groupData.children && groupData.children.length > 0) {
        groupData.children.forEach(childData => {
          const child = document.createElement('div');
          child.className = 'product-type-item child-item';
          child.innerHTML = `
            <span class="level-tag level-2">二级</span>
            <span class="type-name">${childData.name}</span>
            <span class="type-parent">(${groupData.name})</span>
            <span class="type-actions">
              <button class="icon-btn sort-up" title="上移">↑</button>
              <button class="icon-btn sort-down" title="下移">↓</button>
              <button class="icon-btn move-btn" title="变更所属"><</button>
              <button class="icon-btn edit-btn" title="编辑">✏️</button>
              <button class="icon-btn del-btn" title="删除">🗑️</button>
            </span>
          `;
          childrenContainer.appendChild(child);
          bindChildItemEvents(child, childrenContainer);
        });
      }
      
      productTypeTree.appendChild(group);
      bindGroupEvents(group);
    });
    
    bindProductEditButtons();
  }

  // 页面加载时恢复产品类型数据
  loadProductTypes();

});


// ========== 系统管理功能（全局函数） ==========



// 保存系统标题

function saveSystemTitle() {

  const title = document.getElementById('systemTitle')?.value.trim();

  if (!title) {

    showToast('请输入系统标题', 'error');

    return;

  }

  // 更新页面标题

  const appTitle = document.querySelector('.app-title');

  if (appTitle) appTitle.textContent = title;

  document.title = title;

  showToast('系统标题已保存', 'success');

}



// 保存设计天数

function saveDesignDays() {

  const days = parseInt(document.getElementById('designDays')?.value);

  if (!days || days < 1) {

    showToast('请输入有效的天数', 'error');

    return;

  }

  showToast(`设计完成日期已设置为 ${days} 天`, 'success');

}



// 修改密码

function changePassword() {

  const overlay = document.getElementById('modalOverlay');

  const title = document.getElementById('modalTitle');

  const body = document.getElementById('modalBody');



  if (title) title.textContent = '修改管理密码';

  if (body) {

    body.innerHTML = `

      <div class="form-group">

        <label>当前密码</label>

        <input type="password" id="currentPwd" placeholder="请输入当前密码">

      </div>

      <div class="form-group">

        <label>新密码</label>

        <input type="password" id="newPwd" placeholder="请输入新密码">

      </div>

      <div class="form-group">

        <label>确认新密码</label>

        <input type="password" id="confirmPwd" placeholder="请再次输入新密码">

      </div>

    `;

  }

  if (overlay) overlay.classList.add('active');



  // 临时替换确认按钮行为

  const confirmBtn = document.getElementById('modalConfirm');

  const cancelBtn = document.getElementById('modalCancel');

  const closeBtn = document.getElementById('modalClose');



  const handleConfirm = () => {

    const current = document.getElementById('currentPwd')?.value;

    const newPwd = document.getElementById('newPwd')?.value;

    const confirm = document.getElementById('confirmPwd')?.value;



    if (!current) { showToast('请输入当前密码', 'error'); return; }

    if (!newPwd) { showToast('请输入新密码', 'error'); return; }

    if (newPwd !== confirm) { showToast('两次输入的密码不一致', 'error'); return; }

    if (newPwd.length < 4) { showToast('密码长度不能少于4位', 'error'); return; }



    showToast('密码修改成功', 'success');

    closeModal();

    cleanup();

  };



  const closeModal = () => {

    if (overlay) overlay.classList.remove('active');

    cleanup();

  };



  const cleanup = () => {

    confirmBtn.removeEventListener('click', handleConfirm);

    cancelBtn.removeEventListener('click', closeModal);

    closeBtn.removeEventListener('click', closeModal);

  };



  confirmBtn.addEventListener('click', handleConfirm);

  cancelBtn.addEventListener('click', closeModal);

  closeBtn.addEventListener('click', closeModal);

}




