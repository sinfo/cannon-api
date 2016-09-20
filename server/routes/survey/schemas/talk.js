module.exports = {
  title: 'Survey',
  type: 'object',
  properties: {
    age: {
      type: 'string',
      title: 'Age',
      enum: [
        '< 18',
        '18-22',
        '23-25',
        '26-28',
        '> 28'
      ]
    },
    gender: {
      type: 'string',
      title: 'Gender',
      enum: [
        'Male',
        'Female'
      ]
    },
    area: {
      type: 'string',
      title: 'What\'s your formation area?',
      enum: [
        'Computer Engineering',
        'Electrotechnical Engineering',
        'Management',
        'Economy',
        'Design',
        'Other'
      ]
    },
    areaOther: {
      type: 'string',
      title: 'If you selected \'other\' on the previous question, which one is it?'
    },
    isIST: {
      type: 'boolean',
      title: 'Are you an IST student?'
    },
    satisfaction: {
      type: 'string',
      title: 'How satisfied are you with this SINFO edition in general?',
      enum: [
        'Very Satisfied',
        'Satisfied',
        'Unsatisfied',
        'Very Unsatisfied'
      ],
      default: 'Very Satisfied'
    },
    logistics: {
      type: 'object',
      title: 'How would you rate the logistics details of SINFO?',
      properties: {
        installations: {
          type: 'number',
          title: 'Installations and Confort',
          enum: [1, 2, 3, 4, 5],
          default: 5
        },
        location: {
          type: 'number',
          title: 'Location',
          enum: [1, 2, 3, 4, 5],
          default: 5
        },
        organization: {
          type: 'number',
          title: 'Organization',
          enum: [1, 2, 3, 4, 5],
          default: 5
        },
        communication: {
          type: 'number',
          title: 'Communication',
          enum: [1, 2, 3, 4, 5],
          default: 5
        }
      }
    },
    session: {
      type: 'object',
      title: 'How would you rate the logistics details of this presentation?',
      properties: {
        organization: {
          type: 'number',
          title: 'Was well organized',
          enum: [1, 2, 3, 4, 5],
          default: 5
        },
        content: {
          type: 'number',
          title: 'The content was interesting',
          enum: [1, 2, 3, 4, 5],
          default: 5
        },
        speaker: {
          type: 'number',
          title: 'Would reccomend this speaker',
          enum: [1, 2, 3, 4, 5],
          default: 5
        },
        duration: {
          type: 'number',
          title: 'The duration was adequated to the content',
          enum: [1, 2, 3, 4, 5],
          default: 5
        },
        recommend: {
          type: 'number',
          title: 'Would recommend this talk',
          enum: [1, 2, 3, 4, 5],
          default: 5
        }
      }
    },
    suggestions: {
      type: 'string',
      title: 'Any suggestions to SINFO?'
    }
  }
}
