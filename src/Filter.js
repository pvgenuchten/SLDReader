const Filters = {
  featureid: (value, feature) => {
    for (let i = 0; i < value.length; i += 1) {
      if (value[i] === feature.id) {
        return true;
      }
    }
    return false;
  },
  not: (value, feature) => !filterSelector(value, feature),
  or: (value, feature) => {
    const keys = Object.keys(value);
    for (let i = 0; i < keys.length; i += 1) {
      if (value[keys[i]].length === 1 && filterSelector(value, feature, i)) {
        return true;
      } else if (value[keys[i]].length !== 1) {
        throw new Error('multiple ops of same type not implemented yet');
      }
    }
    return false;
  },
  propertyisequalto: (value, feature) =>
    feature.properties[value['0'].propertyname] &&
    feature.properties[value['0'].propertyname] === value['0'].literal,
  propertyislessthan: (value, feature) =>
    feature.properties[value['0'].propertyname] &&
    Number(feature.properties[value['0'].propertyname]) < Number(value['0'].literal),
};

/**
 * [filterSelector description]
 * @private
 * @param  {Filter} filter
 * @param  {object} feature feature
 * @param {number} key index of property to use
 * @return {boolean}
 */
export function filterSelector(filter, feature, key = 0) {
  const type = Object.keys(filter)[key];
  if (Filters[type]) {
    if (Filters[type](filter[type], feature)) {
      return true;
    }
  } else {
    throw new Error(`Unknown filter ${type}`);
  }
  return false;
}

/**
 * [scaleSelector description]
 * The "standardized rendering pixel size" is defined to be 0.28mm × 0.28mm
 * @private
 * @param  {Rule} rule
 * @param  {number} resolution  m/px
 * @return {boolean}
 */
export function scaleSelector(rule, resolution) {
  if (rule.maxscaledenominator !== undefined && rule.minscaledenominator !== undefined) {
    if (
      resolution / 0.00028 < rule.maxscaledenominator &&
      resolution / 0.00028 > rule.minscaledenominator
    ) {
      return true;
    }
    return false;
  }
  if (rule.maxscaledenominator !== undefined) {
    return resolution / 0.00028 < rule.maxscaledenominator;
  }
  if (rule.minscaledenominator !== undefined) {
    return resolution / 0.00028 > rule.minscaledenominator;
  }
  return true;
}
