import * as distanceInWordsStrict from 'date-fns/distance_in_words_strict';
import tippy from 'tippy.js';

import { setACSLocalStorage, ACS } from './localStorage';
import {
  updateState, getWoWheadURL, sortByProfit, getTUJBaseURL, cloneOrigin, MaterialInfoTippyHead, getCurrencyElements,
} from './helper';
import { AuctionCraftSniper } from './types';

const checkboxEventListener = function (e: Event) {
  e.stopPropagation();

  const { value, checked } = <HTMLInputElement> this;
  const index = ACS.professions.indexOf(parseInt(value));

  this.previousElementSibling.classList.toggle('icon-disabled');

  if (checked && index === -1) {
    ACS.professions.push(parseInt(value));
  } else {
    ACS.professions.splice(index, 1);
  }

  setACSLocalStorage({ professions: ACS.professions });
};

const expansionLevelListener = (expansionLevel: number) => setACSLocalStorage({ expansionLevel });

const searchListener = () => {
  const value = (<HTMLInputElement>document.getElementById('realm')).value.split('-');

  if (value.length === 2) {
    console.time('search');
    toggleUserInputs(true);
    validateRegionRealm(value);
  }
};

const toggleUserInputs = (state: boolean) => {
  document.querySelectorAll('input').forEach(input => (input.type === 'checkbox' ? (input.disabled = state) : (input.readOnly = state)));
  [<HTMLInputElement>document.getElementById('search'), <HTMLSelectElement>document.getElementById('expansion-level')].forEach(el => (el.disabled = state));
};

const validateRegionRealm = async (value: string[]) => {
  const region: string = value[0];
  const realm: string = value[1];

  updateState('validateRegionRealm');

  await fetch(`api/validateRegionRealm.php?region=${region}&realm=${realm}`, {
    method: 'GET',
    credentials: 'same-origin',
    mode: 'same-origin',
  })
    .then(response => response.json())
    .then(json => {
      // only proceed when input is valid REGION-REALM pair and server responded with house ID
      if (json.houseID) {
        setACSLocalStorage({ houseID: json.houseID });
        checkHouseAge();
      }
    })
    .catch(err => {
      console.error(`Error validating region and/or realm: ${err}`);
    });
};

const checkHouseAge = async () => {
  const { houseID, expansionLevel } = ACS;

  if (houseID !== undefined) {
    updateState('checkHouseAge');

    const data = await fetch(`api/checkHouseAge.php?houseID=${houseID}&expansionLevel=${expansionLevel}`, {
      method: 'GET',
      credentials: 'same-origin',
      mode: 'same-origin',
    });

    const json: AuctionCraftSniper.checkHouseAgeJSON = await data.json();

    if (json.lastUpdate !== 0) {
      insertLastUpdate(json.lastUpdate);
    }

    switch (json.callback) {
      case 'houseRequiresUpdate':
        getAuctionHouseData();
        break;
      case 'getProfessionTables':
        getProfessionTables();
        break;
      default:
        throw new Error('invalid callback');
    }
  } else {
    console.warn(`Insufficient params - professions: house: ${houseID}`);
  }
};

const parseAuctionData = async (step = 0, itemIDs = {}) => {
  const payload: AuctionCraftSniper.parseAuctionDataPayload = {
    houseID: ACS.houseID,
    itemIDs,
    expansionLevel: ACS.expansionLevel,
  };

  if (step > 0) {
    payload.step = step;
  }

  updateState('parseAuctionData');

  const data = await fetch('api/parseAuctionData.php', {
    method: 'POST',
    body: JSON.stringify(payload),
    mode: 'same-origin',
    credentials: 'same-origin',
  });

  const json: AuctionCraftSniper.parseAuctionDataResponseJSON = await data.json();

  if (json.err) {
    throw new Error(json.err);
  } else {
    document.getElementById('progress-bar').style.width = `${json.percentDone}%`;
  }

  if (json.step < json.reqSteps) {
    parseAuctionData(json.step, json.itemIDs);
  } else if (json.reqSteps === json.step && json.callback === 'getProfessionTables') {
    getProfessionTables();
  }
};

const getAuctionHouseData = async () => {
  updateState('getAuctionHouseData');

  const data = await fetch(`api/getAuctionHouseData.php?houseID=${ACS.houseID}`, {
    method: 'GET',
    credentials: 'same-origin',
    mode: 'same-origin',
  });

  const json = await data.json();

  switch (json.callback) {
    case 'parseAuctionData':
      parseAuctionData();
      break;
    default:
      throw new Error('invalid callback');
  }
};

const getProfessionTables = async () => {
  updateState('getProfessionTables');

  const { houseID, expansionLevel, professions } = ACS;

  const data = await fetch(`api/getProfessionTables.php?houseID=${houseID}&expansionLevel=${expansionLevel}&professions=${professions.toString()}`, {
    method: 'GET',
    credentials: 'same-origin',
    mode: 'same-origin',
  });

  const json: AuctionCraftSniper.outerProfessionDataJSON = await data.json();

  createProfessionTables(json);
};

const createProductNameTD = (id: number, name: string) => {
  const td = <HTMLTableCellElement>cloneOrigin.td.cloneNode();
  td.innerHTML = `<a href="${getWoWheadURL(id)}">${name}</a>`;

  return td;
};

const createProfitTD = (profit: number) => {
  const td = <HTMLTableCellElement>cloneOrigin.td.cloneNode();
  td.appendChild(formatCurrency(profit));

  return td;
};

const createProfessionTables = (json: AuctionCraftSniper.outerProfessionDataJSON = {}) => {
  console.time('createProfessionTables');
  const wrap = <HTMLDivElement>document.getElementById('auction-craft-sniper');

  const TUJLink = getTUJBaseURL();

  const thTexts = ['itemName', 'materialInfo', 'productBuyout', 'profit'];

  const fragment = document.createDocumentFragment();

  Object.entries(json).forEach(entry => {
    let professionName: string;
    let recipes: AuctionCraftSniper.innerProfessionDataJSON[];
    [professionName, recipes] = entry;
    console.time(professionName);

    const previousProfessionTable = <HTMLTableElement>document.getElementById(professionName.toLowerCase());

    const [table, thead, theadRow] = [<HTMLTableElement>cloneOrigin.table.cloneNode(), cloneOrigin.thead.cloneNode(), cloneOrigin.tr.cloneNode()];
    table.id = professionName.toLowerCase();

    thTexts.forEach(thText => {
      const th = <HTMLTableHeaderCellElement>cloneOrigin.th.cloneNode();
      th.innerText = thText;
      theadRow.appendChild(th);
    });
    thead.appendChild(theadRow);
    table.appendChild(thead);

    const positiveTbody = cloneOrigin.tbody.cloneNode();
    const negativeTbody = <HTMLTableSectionElement>cloneOrigin.tbody.cloneNode();
    negativeTbody.classList.add('lossy-recipes');

    sortByProfit(recipes).forEach(recipe => {
      const tr = <HTMLTableRowElement>cloneOrigin.tr.cloneNode();
      tr.dataset.recipe = recipe.product.item.toString();

      const productNameTD = createProductNameTD(recipe.product.item, recipe.product.name);

      const [materialTD, materialSum] = createMaterialTD(recipe);

      const productBuyoutTD = <HTMLTableCellElement>createProductBuyoutTD(recipe, TUJLink);

      const profitTD = <HTMLTableCellElement>createProfitTD(recipe.profit);

      /*
      const percentageProfit = Math.round(recipe.product.buyout / materialSum) * 100 - 100;
      tippy(profitTD, { content: `${percentageProfit > 0 ? '' : '-'}${percentageProfit.toPrecision(2)}'%` });
      */

      [productNameTD, materialTD, productBuyoutTD, profitTD].forEach(td => tr.appendChild(td));

      if (recipe.profit > 0 || ACS.settings.alwaysShowLossyRecipes) {
        positiveTbody.appendChild(tr);
      } else {
        negativeTbody.appendChild(tr);
      }
    });

    if (!positiveTbody.hasChildNodes) {
      positiveTbody.appendChild(createMissingProfitsHintTR());
    }

    if (negativeTbody.hasChildNodes) {
      positiveTbody.appendChild(createLossyRecipeHintTR());
    }

    const tbodies = [positiveTbody, negativeTbody];

    if (previousProfessionTable !== null) {
      while (previousProfessionTable.firstChild) {
        previousProfessionTable.removeChild(previousProfessionTable.lastChild);
      }

      tbodies.forEach(tbody => previousProfessionTable.appendChild(tbody));
    } else {
      tbodies.forEach(tbody => (tbody.hasChildNodes ? table.appendChild(tbody) : void 0));
      fragment.appendChild(table);
    }

    console.log(fragment.childNodes);

    console.timeEnd(professionName);
  });

  wrap.appendChild(fragment);

  toggleUserInputs(false);
  updateState('default');
  console.timeEnd('createProfessionTables');
  console.timeEnd('search');
};

const createMissingProfitsHintTR = function () {
  const hintTR = cloneOrigin.tr.cloneNode();

  const hintTD = <HTMLTableCellElement>cloneOrigin.td.cloneNode();
  hintTD.classList.add('missing-profits-hint');
  hintTD.colSpan = 4;
  hintTD.innerText = 'currently no recipes net profit';

  hintTR.appendChild(hintTD);
  return hintTR;
};

const toggleLossyRecipes = function () {
  const target = <HTMLTableSectionElement> this.parentElement.nextElementSibling;
  const innerTD = this.querySelector('td');

  const isVisible = target.style.display === 'table-row-group';

  if (isVisible) {
    target.style.display = 'none';
    innerTD.innerText = 'show lossy recipes';
  } else {
    target.style.display = 'table-row-group';
    innerTD.innerText = 'hide lossy recipes';
  }
};

const createLossyRecipeHintTR = () => {
  const hintTR = cloneOrigin.tr.cloneNode();
  hintTR.addEventListener('click', toggleLossyRecipes);

  const hintTD = <HTMLTableCellElement>cloneOrigin.td.cloneNode();
  hintTD.classList.add('lossy-recipes-hint');
  hintTD.colSpan = 4;
  hintTD.innerText = 'show lossy recipes';

  hintTR.appendChild(hintTD);
  return hintTR;
};

export const addEventListeners = () => {
  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox: HTMLInputElement) => checkbox.addEventListener('click', checkboxEventListener));
  (<HTMLInputElement>document.getElementById('search')).addEventListener('click', searchListener);

  const expansionLevelSelect = <HTMLSelectElement>document.getElementById('expansion-level');
  expansionLevelSelect.addEventListener('change', () => expansionLevelListener(parseInt(expansionLevelSelect.value)));
};

const formatCurrency = (value: number) => {
  let isNegative = false;

  if (value < 0) {
    value *= -1;
    isNegative = true;
  }

  const valueObj: AuctionCraftSniper.valueObj = {
    isNegative,
    gold: 0,
    silver: 0,
    copper: 0,
  };

  if (value < 100) {
    valueObj.copper = value;
    return getCurrencyElements(valueObj);
  }

  if (value < 10000) {
    valueObj.silver = Math.floor(value / 100);
    valueObj.copper = value - valueObj.silver * 100;

    return getCurrencyElements(valueObj);
  }

  valueObj.gold = Math.floor(value / 100 / 100);
  valueObj.silver = Math.floor((value - valueObj.gold * 100 * 100) / 100);
  valueObj.copper = Math.floor(value - valueObj.gold * 100 * 100 - valueObj.silver * 100);

  return getCurrencyElements(valueObj);
};

const createMaterialTD = (recipe: AuctionCraftSniper.innerProfessionDataJSON): [HTMLTableDataCellElement, number] => {
  const materialInfoTD = <HTMLTableCellElement>cloneOrigin.td.cloneNode();
  let materialSum = 0;

  const tippyTable = <HTMLTableElement>cloneOrigin.table.cloneNode();
  const [thead, tbody] = [MaterialInfoTippyHead.cloneNode(true), cloneOrigin.tbody.cloneNode()];

  recipe.materials.forEach(material => {
    const tr = cloneOrigin.tr.cloneNode();

    for (let i = 0; i <= 3; ++i) {
      const td = <HTMLTableCellElement>cloneOrigin.td.cloneNode();

      switch (i) {
        case 0:
          const a = <HTMLAnchorElement>cloneOrigin.a.cloneNode();
          a.href = getWoWheadURL(material.itemID);
          a.innerText = material.name;
          td.appendChild(a);
          break;
        case 1:
          td.style.textAlign = 'right';
          td.innerText = material.amount.toString();
          break;
        case 2:
          td.style.textAlign = 'right';
          td.appendChild(formatCurrency(material.buyout));
          break;
        case 3:
          td.style.textAlign = 'right';
          td.appendChild(formatCurrency(material.amount * material.buyout));
          break;
      }

      tr.appendChild(td);
    }

    tbody.appendChild(tr);

    materialSum += material.buyout * material.amount;
  });

  materialInfoTD.appendChild(formatCurrency(materialSum));

  tippyTable.appendChild(thead);
  tippyTable.appendChild(tbody);
  tippy(materialInfoTD, { content: tippyTable });

  return [materialInfoTD, materialSum];
};

const createProductBuyoutTD = (recipe: AuctionCraftSniper.innerProfessionDataJSON, TUJBaseUrl: string) => {
  const productBuyoutTD = <HTMLTableCellElement>cloneOrigin.td.cloneNode();

  const a = <HTMLAnchorElement>cloneOrigin.a.cloneNode();
  a.classList.add('tuj');
  a.target = '_blank';
  a.href = `${TUJBaseUrl}${recipe.product.item}`;

  tippy(a, { content: `TUJ - ${recipe.product.name}` });

  [a, formatCurrency(recipe.product.buyout)].forEach(el => productBuyoutTD.appendChild(el));

  return productBuyoutTD;
};

const insertLastUpdate = (lastUpdate: number) => {
  const date = new Date(lastUpdate);

  const target = document.getElementById('last-update');

  target.innerText = distanceInWordsStrict(new Date(), lastUpdate, { addSuffix: true });

  tippy('#last-update', { content: `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}` });
};
