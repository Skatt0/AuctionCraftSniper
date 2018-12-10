export declare namespace AuctionCraftSniper {
  interface cloneOriginCurrencynObj {
    gold?: HTMLSpanElement;
    silver?: HTMLSpanElement;
    copper?: HTMLSpanElement;
  }

  interface cloneOriginObj {
    table?: HTMLTableElement;
    thead?: HTMLTableSectionElement;
    tbody?: HTMLTableSectionElement;
    th?: HTMLTableHeaderCellElement;
    tr?: HTMLTableRowElement;
    td?: HTMLTableCellElement;
    a?: HTMLAnchorElement;
    div?: HTMLDivElement;
    button?: HTMLButtonElement;
    strong?: HTMLElement;
    currencies?: cloneOriginCurrencynObj;
  }

  interface parseAuctionDataPayload {
    itemIDs?: object;
    step?: number;
    houseID: number;
    expansionLevel: number;
  }

  interface parseAuctionDataResponseJSON {
    itemIDs: number[];
    percentDone: number;
    reqSteps: number;
    step: number;

    err?: string;
    callback?: string;
  }

  interface ACSSettingsObj {
    blacklistedRecipes?: number[];
    alwaysShowLossyRecipes?: boolean;
    fetchOnLoad?: boolean;
    pushNotificationsAllowed?: boolean;
  }

  interface localStorageObj {
    houseID?: undefined | number;
    professions?: number[];
    expansionLevel?: number;
    lastUpdate?: number;
    currentTab?: undefined | string;
    settings?: ACSSettingsObj;
  }

  interface materialJSON {
    buyout: number;
    name: string;
    amount: number;
    itemID: number;
  }

  interface productJSON {
    buyout: number;
    item: number;
    name: string;
    producedQuantity: number;
  }

  interface innerProfessionDataJSON {
    materials: materialJSON[];
    product: productJSON;
    profit: number;
    margin: number;
    materialCostSum: number;
  }

  interface outerProfessionDataJSON {
    alchemy?: innerProfessionDataJSON[];
    blacksmithing?: innerProfessionDataJSON[];
    cooking?: innerProfessionDataJSON[];
    enchanting?: innerProfessionDataJSON[];
    engineering?: innerProfessionDataJSON[];
    inscription?: innerProfessionDataJSON[];
    jewelcrafting?: innerProfessionDataJSON[];
    leatherworking?: innerProfessionDataJSON[];
    tailoring?: innerProfessionDataJSON[];
    callback?: string;
  }

  interface valueObj {
    isNegative: boolean;
    gold: number;
    silver: number;
    copper: number;
  }

  interface checkHouseAgeJSON {
    callback: string;
    lastUpdate: number;
  }

  interface currencyObj {
    gold?: HTMLSpanElement;
    silver?: HTMLSpanElement;
    copper?: HTMLSpanElement;
  }

  interface innerProfessionDataJSON {
    materials: materialJSON[];
    product: productJSON;
    profit: number;
  }

  interface materialJSON {
    buyout: number;
    name: string;
    rank: number;
    amount: number;
    itemID: number;
  }

  interface productJSON {
    buyout: number;
    item: number;
    name: string;
  }
}
