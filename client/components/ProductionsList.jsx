import React from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import SimpleTable from './SimpleTable';

const GET_PRODUCTIONS = gql`
  query Productions($year: Int, $member: ID, $types: [String]) {
    productions(year: $year, member: $member types: $types) {
      _id
      title
      authors
      type
    }
  }
`;

const ProductionsList = ({ year, member, types }) => (
  <Query query={GET_PRODUCTIONS} variables={{ year, member, types }}>
    {({ loading, error, data }) => {
      if (loading) return <p>Carregando</p>;
      if (error) return <p>Erro</p>;

      return (
        <SimpleTable
          data={data.productions.map(({
            _id, title, authors, type,
          }) => ({
            id: _id, title, authors, type,
          }))}
          headers={[
            {
              id: 'title', numeric: false, disablePadding: false, label: 'Título',
            },
            {
              id: 'authors', numeric: false, disablePadding: false, label: 'Autores',
            },
            {
              id: 'type', numeric: false, disablePadding: false, label: 'Tipo',
            },
          ]}
        />
      );
    }}
  </Query>
);

ProductionsList.propTypes = {
  year: PropTypes.number,
  member: PropTypes.string,
  types: PropTypes.arrayOf(PropTypes.string).isRequired,
};

ProductionsList.defaultProps = {
  year: undefined,
  member: undefined,
};

export default ProductionsList;