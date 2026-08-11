// 5空間の確定コピー・世界観。出典: プロジェクト/BESSON/コピー探求プロンプト.md, ブランドコンセプト.md（2026-08-11現行版）
// すべて「仮確定」（Pinterest背景写真検品での最終凍結は未実施）。差し替える場合はVault側の凍結手順を先に踏むこと。

export type CategoryKey = 'bistro' | 'lounge' | 'bar' | 'grand-maison' | 'chateau';

export interface CategoryInfo {
  key: CategoryKey;
  slug: string;
  name: string;
  copy: string;
  worldview: string;
  models: string[];
  bottleRange: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    key: 'bistro',
    slug: 'bistro',
    name: 'Bistro',
    copy: '気取らない扉を、押してみる。',
    worldview: '気取らない扉の奥に、本物がある店',
    models: ['C28st', 'C18st'],
    bottleRange: '18〜28本',
  },
  {
    key: 'lounge',
    slug: 'lounge',
    name: 'The Lounge',
    copy: '時間の流れが、ここだけ変わる。',
    worldview: '特別な日を待たない、館の寛ぎ',
    models: ['C36', 'C27', 'C18', 'C12'],
    bottleRange: '12〜36本',
  },
  {
    key: 'bar',
    slug: 'bar',
    name: 'The Bar',
    copy: 'グラスが鳴って、夜が深まる。',
    worldview: '夜のいちばん端の、自分だけのカウンター',
    models: ['C7'],
    bottleRange: '7本',
  },
  {
    key: 'grand-maison',
    slug: 'grand-maison',
    name: 'Grand Maison',
    copy: 'フルコースの隣に、ワインリストを。',
    worldview: '祝祭の晩餐と、継承の器',
    models: ['C177', 'C133', 'C80', 'C55'],
    bottleRange: '55〜177本',
  },
  {
    key: 'chateau',
    slug: 'chateau',
    name: 'Château',
    copy: '建築家と、ワインのこだわりを。',
    worldview: 'あなたの家に建てる、あなたのシャトー',
    models: [],
    bottleRange: '受注生産',
  },
];

export const TAGLINE = 'まだ知らない喜びが、ある。';
export const WHY = '私たちは、まだ気づいていない喜びを、見つけ出す。';
export const BRAND_STATEMENT =
  'BESSONは日本のD2Cワインセラーブランド。「ワインセラーを売るブランド」ではなく「ワインのある上質な空間をデザインするライフスタイルブランド」。';
