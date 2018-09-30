import React from 'react';
import PropTypes from 'prop-types';
import { OrdinalFrame } from 'semiotic';

const BarChart = ({ data }) => {
  const indexedData = data
    .reduce((obj, el) =>
      Object.assign(obj, {
        [el.type]: el.count,
      }), {});

  return (
    <OrdinalFrame
      size={[1000, 500]}
      data={data}
      oAccessor="type"
      rAccessor="count"
      type="bar"
      projection="horizontal"
      axis={{
        rotate: '45',
      }}
      margin={{
        top: 5, bottom: 50, right: 20, left: 300,
      }}
      oLabel
      sortO={(a, b) => indexedData[a] > indexedData[b]}
      oPadding={2}
      baseMarkProps={{ forceUpdate: true }}
    />
  );
};

BarChart.propTypes = {
  data: PropTypes.shape({
    type: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
  }).isRequired,
};

export default BarChart;