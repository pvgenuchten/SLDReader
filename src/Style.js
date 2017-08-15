import Reader from './Reader';

const Filters = {
  featureid: (value, props) => {
    for (let i = 0; i < value.length; i += 1) {
      if (value[i] === props.fid) {
        return true;
      }
    }
    return false;
  },
  not: (value, props) => !filterSelector(value, props),
  or: (value, props) => {
    const keys = Object.keys(value);
    for (let i = 0; i < keys.length; i += 1) {
      if (value[keys[i]].length === 1 && filterSelector(value, props, i)) {
        return true;
      } else if (value[keys[i]].length !== 1) {
        throw new Error('multiple ops of same type not implemented yet');
      }
    }
    return false;
  },
  propertyisequalto: (value, props) => (props[value['0'].propertyname] &&
    props[value['0'].propertyname] === value['0'].literal),
  propertyislessthan: (value, props) => (props[value['0'].propertyname] &&
    Number(props[value['0'].propertyname]) < Number(value['0'].literal)),
};

/**
 * [filterSelector description]
 * @private
 * @param  {Filter} filter
 * @param  {object} properties feature properties
 * @param {number} key index of property to use
 * @return {boolean}
 */
function filterSelector(filter, properties, key = 0) {
  const type = Object.keys(filter)[key];
  if (Filters[type]) {
    if (Filters[type](filter[type], properties)) {
      return true;
    }
  } else {
    throw new Error(`Unkown filter ${type}`);
  }
  return false;
}


/**
 * Base class for library specific style classes
 * After creating an instance you should call the read method.
 */
class Style {
  /**
   * Read xml file
   * @param  {string} sld xml string
   * @param {string} [layername] Select layer matching case insensitive, defaults to first layer
   * @param {string} [stylename] Select style case insensitive, defaults to first style
   * @return {void}
   */
  read(sld, layername, stylename) {
    this.sld = Reader(sld);
    this.setStyle(layername, stylename);
  }
  /**
   * Change selected layer and style from sld to use
   * @param {string} [layername]  Select layer matching lowercased layername
   * @param {string} [stylename] style to use
   */
  setStyle(layername, stylename) {
    let filteredlayers;
    if (layername) {
      filteredlayers = this.sld.layers.filter(l =>
        (l.name.toLowerCase() === layername.toLowerCase()));
    }
    this.layer = (filteredlayers) ? filteredlayers['0'] : this.sld.layers['0'];
    this.style = this.layer.styles.filter(s => ((stylename) ? (s.name.toLowerCase() === stylename.toLowerCase()) : s.default))['0'];
  }


  /**
   * get sld rules for feature
   * @param  {Object} properties feature properties
   * @return {Rule} filtered sld rules
   */
  getRules(properties) {
    if (!this.style) {
      throw new Error('Set a style to use');
    }
    const result = [];
    const FeatureTypeStyleLength = this.style.featuretypestyles.length;
    for (let i = 0; i < FeatureTypeStyleLength; i += 1) {
      const fttypestyle = this.style.featuretypestyles[i];
      for (let j = 0; j < fttypestyle.rules.length; j += 1) {
        const rule = fttypestyle.rules[j];
        if (rule.filter && filterSelector(rule.filter, properties)) {
          result.push(rule);
        } else if (rule.elsefilter && result.length === 0) {
          result.push(rule);
        } else if (!rule.elsefilter && !rule.filter) {
          result.push(rule);
        }
      }
    }
    return result;
  }
}


export default Style;
