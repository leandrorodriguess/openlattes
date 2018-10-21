import mongoose from 'mongoose';

import Member from './models/Member';
import Production from './models/Production';
import Collaboration from './models/Collaboration';

const { ObjectId } = mongoose.Types;

function matchMembers(ids) {
  if (ids && ids.length > 0) {
    const objectIds = ids.map(_id => ObjectId(_id));

    return [
      {
        $match: {
          members: (ids.length > 1) ? { $in: objectIds } : objectIds[0],
        },
      },
    ];
  }

  return [];
}


const resolvers = {
  Query: {
    member: (root, { _id }) => Member.findById(_id),

    members: () => Member.find(),

    production: (root, { _id }) => Production.findById(_id),

    productions: () => Production.find(),

    indicator: (root, { members }) =>
      Production.aggregate(matchMembers(members)
        .concat([
          {
            $group: {
              _id: { year: '$year', type: '$type' },
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              year: '$_id.year',
              type: '$_id.type',
              count: 1,
            },
          },
          {
            $sort: {
              type: -1,
              year: -1,
            },
          },
        ])),

    typeIndicator: (root, { members }) =>
      Production.aggregate(matchMembers(members)
        .concat([
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              type: '$_id',
              _id: 0,
              count: 1,
            },
          },
        ])),

    memberIndicator: () =>
      Production.aggregate([
        {
          $unwind: '$members',
        },
        {
          $group: {
            _id: '$members',
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'members',
            localField: '_id',
            foreignField: '_id',
            as: 'members_data',
          },
        },
        {
          $project: {
            _id: 0,
            member: { $arrayElemAt: ['$members_data.fullName', 0] },
            count: 1,
          },
        },
      ]),

    graph: () => ({ edges: null, nodes: null }),
  },

  Graph: {
    nodes: () =>
      Collaboration.aggregate([
        {
          $unwind: '$members',
        },
        {
          $group: {
            _id: '$members',
          },
        },
        {
          $lookup: {
            from: 'members',
            localField: '_id',
            foreignField: '_id',
            as: 'members_data',
          },
        },
        {
          $project: {
            id: '$_id',
            fullName: { $arrayElemAt: ['$members_data.fullName', 0] },
            citationName: { $arrayElemAt: ['$members_data.citationName', 0] },
            lattesId: { $arrayElemAt: ['$members_data.lattesId', 0] },
            cvLastUpdate: { $arrayElemAt: ['$members_data.cvLastUpdate', 0] },
          },
        },
      ]),

    edges: () =>
      Collaboration.aggregate([
        {
          $project: {
            _id: 0,
            source: { $arrayElemAt: ['$members', 0] },
            target: { $arrayElemAt: ['$members', 1] },
            weight: { $size: '$productions' },
            productions: 1,
          },
        },
      ]),
  },

  Production: {
    members: ({ members }) => Member.find({ _id: { $in: members } }),
  },
};

export default resolvers;
