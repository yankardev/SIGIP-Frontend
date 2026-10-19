import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type ViewKey = 'dashboard' | 'catalogo' | 'pedidos' | 'disenos' | 'produccion' | 'inventario' | 'notificaciones' | 'reportes' | 'usuarios';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  isLoggedIn = false;
  activeView: ViewKey = 'dashboard';
  activeRole = 'Administrador';
  loginEmail = '';
  loginPassword = '';
  searchTerm = '';
  toast = '';
  selectedCategory = 'Todos';
  showNewOrder = false;

  readonly navItems: { key: ViewKey; label: string; icon: string; group: string }[] = [
    { key: 'dashboard', label: 'Resumen', icon: '▦', group: 'GENERAL' },
    { key: 'catalogo', label: 'Catálogo', icon: '▤', group: 'VENTAS' },
    { key: 'pedidos', label: 'Pedidos', icon: '▣', group: 'VENTAS' },
    { key: 'disenos', label: 'Diseños', icon: '◇', group: 'OPERACIONES' },
    { key: 'produccion', label: 'Producción', icon: '▥', group: 'OPERACIONES' },
    { key: 'inventario', label: 'Inventario', icon: '▧', group: 'OPERACIONES' },
    { key: 'notificaciones', label: 'Notificaciones', icon: '♧', group: 'SISTEMA' },
    { key: 'reportes', label: 'Reportes', icon: '▥', group: 'SISTEMA' },
    { key: 'usuarios', label: 'Usuarios y roles', icon: '♙', group: 'SISTEMA' }
  ];

  products = [
    { name: 'Tarjetas de presentación', category: 'Papelería', description: 'Acabado profesional en couché mate o brillante.', price: 45, unit: 'por 100 unidades', color: 'lavender', initials: 'TC' },
    { name: 'Volantes publicitarios', category: 'Publicidad', description: 'Impresión a todo color para promocionar tu negocio.', price: 85, unit: 'por 500 unidades', color: 'peach', initials: 'VP' },
    { name: 'Catálogos corporativos', category: 'Editorial', description: 'Presenta tus productos con una impresión de calidad.', price: 160, unit: 'por 50 unidades', color: 'mint', initials: 'CC' },
    { name: 'Banners publicitarios', category: 'Gran formato', description: 'Lona resistente para interiores y exteriores.', price: 65, unit: 'por m²', color: 'blue', initials: 'BA' },
    { name: 'Stickers personalizados', category: 'Publicidad', description: 'Corte personalizado y colores de alta definición.', price: 35, unit: 'por 100 unidades', color: 'yellow', initials: 'SP' },
    { name: 'Afiches A3', category: 'Papelería', description: 'Papel de alta calidad para campañas y eventos.', price: 55, unit: 'por 50 unidades', color: 'rose', initials: 'A3' }
  ];

  orders = [
    { code: 'SIG-2026-0148', client: 'Comercial San José', product: 'Volantes publicitarios', date: '19 oct 2026', amount: 425, status: 'En producción', progress: 68 },
    { code: 'SIG-2026-0147', client: 'María Fernanda Ruiz', product: 'Tarjetas de presentación', date: '18 oct 2026', amount: 180, status: 'Diseño pendiente', progress: 25 },
    { code: 'SIG-2026-0146', client: 'Grupo Norte SAC', product: 'Banners publicitarios', date: '17 oct 2026', amount: 650, status: 'Por entregar', progress: 92 },
    { code: 'SIG-2026-0145', client: 'Café Central', product: 'Stickers personalizados', date: '16 oct 2026', amount: 245, status: 'Completado', progress: 100 }
  ];

  inventory = [
    { name: 'Papel couché A4', sku: 'MAT-001', stock: 840, unit: 'hojas', min: 250, category: 'Papel' },
    { name: 'Tinta cyan', sku: 'TIN-002', stock: 12, unit: 'cartuchos', min: 15, category: 'Tintas' },
    { name: 'Vinil adhesivo', sku: 'VIN-003', stock: 46, unit: 'metros', min: 20, category: 'Materiales' },
    { name: 'Lona banner', sku: 'LON-004', stock: 8, unit: 'rollos', min: 10, category: 'Gran formato' }
  ];

  notifications = [
    { title: 'Diseño pendiente de aprobación', detail: 'Pedido SIG-2026-0147 · María Fernanda Ruiz', time: 'Hace 12 min', unread: true, icon: '◇' },
    { title: 'Stock bajo: Tinta cyan', detail: 'Quedan 12 cartuchos · Mínimo recomendado: 15', time: 'Hace 45 min', unread: true, icon: '▧' },
    { title: 'Pedido listo para entrega', detail: 'Pedido SIG-2026-0146 · Grupo Norte SAC', time: 'Hace 2 h', unread: false, icon: '✓' }
  ];

  get activeTitle(): string {
    return this.navItems.find(item => item.key === this.activeView)?.label ?? 'Resumen';
  }

  get filteredProducts() {
    const term = this.searchTerm.trim().toLowerCase();
    return this.products.filter(product =>
      (this.selectedCategory === 'Todos' || product.category === this.selectedCategory) &&
      (!term || (product.name + ' ' + product.description + ' ' + product.category).toLowerCase().includes(term))
    );
  }

  get filteredOrders() {
    const term = this.searchTerm.trim().toLowerCase();
    return this.orders.filter(order => !term || (order.code + ' ' + order.client + ' ' + order.product + ' ' + order.status).toLowerCase().includes(term));
  }

  get productionCount(): number { return this.orders.filter(order => order.status === 'En producción').length; }
  get readyCount(): number { return this.orders.filter(order => order.status === 'Por entregar').length; }
  get completedCount(): number { return this.orders.filter(order => order.status === 'Completado').length; }

  markAllRead(): void { this.notifications.forEach(notification => notification.unread = false); }

  get unreadCount(): number {
    return this.notifications.filter(notification => notification.unread).length;
  }

  loginAs(role: string): void {
    this.activeRole = role;
    this.isLoggedIn = true;
    this.activeView = role === 'Cliente' ? 'catalogo' : 'dashboard';
    this.toast = 'Bienvenido a SIGIP. Estás en modo demostración.';
    setTimeout(() => this.toast = '', 3500);
  }

  login(): void {
    this.loginAs(this.activeRole);
  }

  logout(): void {
    this.isLoggedIn = false;
    this.loginEmail = '';
    this.loginPassword = '';
  }

  navigate(view: ViewKey): void {
    this.activeView = view;
    this.searchTerm = '';
    this.showNewOrder = false;
  }

  showMessage(message: string): void {
    this.toast = message;
    setTimeout(() => this.toast = '', 3200);
  }

  createOrder(productName?: string): void {
    if (productName) {
      this.showMessage('Producto seleccionado: ' + productName + '. Completa los datos del pedido para continuar.');
    } else {
      this.showNewOrder = true;
    }
  }

  saveDemoOrder(): void {
    this.orders = [{
      code: 'SIG-2026-' + (149 + this.orders.length).toString(),
      client: this.activeRole === 'Cliente' ? (this.loginEmail || 'Cliente de demostración') : 'Nuevo cliente',
      product: 'Solicitud personalizada',
      date: '19 oct 2026',
      amount: 0,
      status: 'Pago pendiente',
      progress: 5
    }, ...this.orders];
    this.showNewOrder = false;
    this.activeView = 'pedidos';
    this.showMessage('Solicitud registrada en la demostración. Aún no se guarda en el servidor.');
  }

  changeOrderStatus(order: { status: string }): void {
    const stages = ['Pago pendiente', 'Diseño pendiente', 'En producción', 'Por entregar', 'Completado'];
    order.status = stages[(stages.indexOf(order.status) + 1) % stages.length];
    this.showMessage('Estado de demostración actualizado: ' + order.status);
  }

  markRead(index: number): void {
    this.notifications[index].unread = false;
  }

  trackByLabel(_: number, item: { label?: string; code?: string; name?: string; title?: string }): string {
    return item.label || item.code || item.name || item.title || String(_);
  }
}
