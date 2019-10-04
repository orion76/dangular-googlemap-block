export interface IEntity {
  id: string;
  source: string;
  title?: string;
  is_new?: boolean;

  drupal_internal__id?: string;
}

export interface iJSONAPI_Response_Relationship {
  data: IJSONAPIEntity | IJSONAPIEntity[];
}

export interface IJSONAPIEntity {
  id: string;
  type: string;
  attributes?: Record<string, string>;
  relationships?: Record<string, iJSONAPI_Response_Relationship>;
}




export interface IPriceTieredAggregatePrice {
  weighted_price: number;
}

export interface IPriceTieredAggregate {
  buy: IPriceTieredAggregatePrice;
  sell: IPriceTieredAggregatePrice;
}

export interface IPriceTieredTierPrice {
  from: number;
  to: number;
  buy_price: number;
  sell_price: number;
}

export interface IDataPriceTiered {
  coin: string;
  aggregate: IPriceTieredAggregate;
  tiers: IPriceTieredTierPrice[];
}
