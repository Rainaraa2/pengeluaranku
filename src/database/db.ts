import Dexie, { type Table } from 'dexie';
import { Transaction } from '../types';

export class PengeluaranKuDB extends Dexie {
  transactions!: Table<Transaction, string>;

  constructor() {
    super('PengeluaranKuDB');
    this.version(1).stores({
      transactions: 'id, nama_barang, tanggal, kategori, jumlah, created_at, updated_at',
    });
  }

  // Generate unique ID
  generateId(): string {
    return 'tx_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
  }

  // Add a new transaction
  async addTransaction(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<string> {
    const now = Date.now();
    const id = data.id || this.generateId();
    const newTx: Transaction = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
    };
    await this.transactions.add(newTx);
    return id;
  }

  // Update existing transaction
  async updateTransaction(id: string, data: Partial<Omit<Transaction, 'id' | 'created_at'>>): Promise<void> {
    const existing = await this.transactions.get(id);
    if (!existing) {
      throw new Error(`Transaksi dengan ID ${id} tidak ditemukan.`);
    }
    const updated: Transaction = {
      ...existing,
      ...data,
      updated_at: Date.now(),
    };
    await this.transactions.put(updated);
  }

  // Delete transaction
  async deleteTransaction(id: string): Promise<void> {
    await this.transactions.delete(id);
  }

  // Get single transaction
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return await this.transactions.get(id);
  }

  // Replace all transactions safely
  async replaceAll(newTransactions: Transaction[]): Promise<number> {
    return await this.transaction('rw', this.transactions, async () => {
      await this.transactions.clear();
      await this.transactions.bulkAdd(newTransactions);
      return newTransactions.length;
    });
  }

  // Merge transactions without duplicates based on id
  async mergeTransactions(incoming: Transaction[]): Promise<{ added: number; skipped: number }> {
    return await this.transaction('rw', this.transactions, async () => {
      let added = 0;
      let skipped = 0;
      for (const item of incoming) {
        const exists = await this.transactions.get(item.id);
        if (exists) {
          skipped++;
        } else {
          await this.transactions.add(item);
          added++;
        }
      }
      return { added, skipped };
    });
  }

  // Clear all data
  async clearAll(): Promise<void> {
    await this.transactions.clear();
  }
}

export const db = new PengeluaranKuDB();
