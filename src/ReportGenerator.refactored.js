export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  // --- 1. MÉTODO EXTRAÍDO ---
  // Esta lógica foi movida de 'generateReport' para cá.
  _generateHeader(reportType, user) {
    if (reportType === 'CSV') {
      return 'ID,NOME,VALOR,USUARIO\n';
    } else if (reportType === 'HTML') {
      let header = '<html><body>\n';
      header += '<h1>Relatório</h1>\n';
      header += `<h2>Usuário: ${user.name}</h2>\n`;
      header += '<table>\n';
      header += '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n';
      return header;
    }
    return '';
  }

  _generateBody(reportType, user, items) {
    let body = '';
    let total = 0;

    for (const item of items) {
      const { row, value } = this._processItemRow(reportType, user, item);
      body += row;
      total += value;
    }

    return { body, total };
  }

  _generateFooter(reportType, total) {
    if (reportType === 'CSV') {
      let footer = '\nTotal,,\n';
      footer += `${total},,\n`;
      return footer;
    } else if (reportType === 'HTML') {
      let footer = '</table>\n';
      footer += `<h3>Total: ${total}</h3>\n`;
      footer += '</body></html>\n';
      return footer;
    }
    return '';
  }

  /**
   * Gera um relatório de itens baseado no tipo e no usuário.
   * - Admins veem tudo.
   * - Users comuns só veem itens com valor <= 500.
   */
  generateReport(reportType, user, items) {
    let report = this._generateHeader(reportType, user);

    // --- Seção do Corpo (Agora refatorada) ---
    const { body, total } = this._generateBody(reportType, user, items);
    report += body;

    // --- Seção do Rodapé (Agora refatorada) ---
    report += this._generateFooter(reportType, total);

    return report.trim();
  }

  // Este método substitui a lógica *dentro* do loop
  _processItemRow(reportType, user, item) {
    let row = '';
    let value = 0;

    // Lógica de filtragem
    const isAdmin = user.role === 'ADMIN';
    const isUser = user.role === 'USER';

    // Usuário comum só vê itens <= 500
    if (isUser && item.value > 500) {
      return { row, value }; // Retorna linha vazia e valor 0
    }

    // Admin ganha bônus de prioridade
    if (isAdmin && item.value > 1000) {
      item.priority = true;
    }

    // Lógica de Formatação (agora sem duplicação)
    if (reportType === 'CSV') {
      row = `${item.id},${item.name},${item.value},${user.name}\n`;
      value = item.value;
    } else if (reportType === 'HTML') {
      const style = item.priority ? ' style="font-weight:bold;"' : '';
      row = `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
      value = item.value;
    }

    return { row, value };
  }
}