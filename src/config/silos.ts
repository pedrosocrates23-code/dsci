/**
 * Silos de serviço (plano SILOS-SEMANTICOS-2026-11-02). A estrutura dos 40 nós mora em silos.json
 * (lido também por scripts/check-silos.mjs). Regras:
 *  1. Fluxo ascendente: neta linka a filha, filha linka a mãe (o template escreve o link do pai).
 *  2. Âncora exata e única por destino: só `anchor` do nó (SiloLink e a trava do build).
 *  3. Mãe = hub, filha = educativa, neta = landing com formulário.
 * Um nó só vira página com o arquivo de conteúdo em src/content/silos/ e o pai no ar.
 */
import { getCollection } from 'astro:content';
import data from './silos.json';

export type SiloLevel = 'mother' | 'child' | 'leaf';
export interface SiloNode { id: string; parent: string | null; slug: string; keyword: string; anchor: string; }

export const SILO_NODES: SiloNode[] = data.nodes;
const byId = new Map(SILO_NODES.map((n) => [n.id, n]));

export const siloNode = (id: string): SiloNode => {
  const n = byId.get(id);
  if (!n) throw new Error(`[silos] nó inexistente: ${id}`);
  return n;
};
/** Da raiz até o nó (inclusive). */
export const siloChain = (id: string): SiloNode[] => {
  const chain: SiloNode[] = [];
  for (let n: SiloNode | undefined = siloNode(id); n; n = n.parent ? siloNode(n.parent) : undefined) chain.unshift(n);
  return chain;
};
export const siloPath = (id: string) => `/services/${siloChain(id).map((n) => n.slug).join('/')}/`;
export const siloLevel = (id: string): SiloLevel => (['mother', 'child', 'leaf'] as const)[id.split('.').length - 1];
export const siloChildren = (id: string) => SILO_NODES.filter((n) => n.parent === id);
/** Nome do arquivo de conteúdo: 1.3.1 → 1-3-1. */
export const siloFileId = (id: string) => id.replaceAll('.', '-');

/** Nós com página no ar: arquivo de conteúdo presente e toda a cadeia acima também. */
export async function liveSiloIds(): Promise<Set<string>> {
  const entries = await getCollection('silos');
  const has = new Set(entries.map((e) => e.data.node));
  return new Set([...has].filter((id) => siloChain(id).every((n) => has.has(n.id))));
}
