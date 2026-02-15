import { Test } from './testTypes';

export const dummyTest: Test = {
  _id: '69906253ca35c9fccf199668',
  title: 'Daily Practice Test 1',
  description: 'Take the daily practice test 1',
  totalQuestions: 10,
  durationInMinutes: 30,
  marksPerQuestion: 4,
  negativeMarking: 1,
  passingScore: 20,
  allowRetake: true,
  shuffleOptions: false,
  showResultsImmediately: true,
  questions: [
    {
      _id: '69918c9af3d6783874a7d28f',
      questionText: {
        en: {
          text: 'In an alloy of German Silver the ratio of Copper and Zinc was 19:6 while the ratio of Nickel and Zinc was 7:4. Then what was the ratio of Copper, Zinc and Nickel?',
          image: null,
        },
        ml: {
          text: 'ജർമ്മൻ സിൽവറിൻ്റെ ഒരു ലോഹസങ്കരത്തിൽ ചെമ്പിന്റെയും സിങ്കിന്റെയും അനുപാതം 19:6 ആണ്',
          image: null,
        },
      },
      optionType: 'text',
      options: [
        {
          id: 'f2ff039f-d8b4-4dc0-8f1e-6bc697e54c0d',
          type: 'text',
          en: '19:44:4',
          ml: '19:44:4',
        },
        {
          id: '5a9c7459-3959-4c5b-a8b3-4d4036181f92',
          type: 'text',
          en: '19:24:7',
          ml: '19:24:7',
        },
        {
          id: '5158b5f7-c291-4629-a251-6fb83f9cac73',
          type: 'text',
          en: '38:12:21',
          ml: '38:12:21',
        },
        {
          id: '848e7b4d-ac7c-4b92-b02d-9354ad5d2d04',
          type: 'text',
          en: '133:42:24',
          ml: '133:42:24',
        },
      ],
      explanation: {
        en: 'Copper : Zinc = 19:6, Nickel : Zinc = 7:4, Therefore Copper : Zinc : Nickel = 38:12:21',
        ml: 'ചെമ്പ് : സിങ്ക് = 19:6, നിക്കൽ : സിങ്ക് = 7:4',
        image: null,
      },
      correctAnswer: '5158b5f7-c291-4629-a251-6fb83f9cac73',
      subject: '67bcc39a003af8ad9fae357f',
      difficultyLevel: 'medium',
    },
    {
      _id: '67d8483543ed63820ea13616',
      questionText: {
        en: {
          text: 'The national census does not recognize which groups within India?',
          image: null,
        },
        ml: {
          text: 'ദേശീയ സെൻസസ് ഇന്ത്യയിലെ ഏതു ഗ്രൂപ്പുകളെയാണ് അംഗീകരിക്കാത്തത്?',
          image: null,
        },
      },
      optionType: 'text',
      options: [
        {
          id: 'opt1',
          type: 'text',
          en: 'Tribal',
          ml: 'ആദിവാസി',
        },
        {
          id: 'opt2',
          type: 'text',
          en: 'Ethnic',
          ml: 'വംശീയ',
        },
        {
          id: 'opt3',
          type: 'text',
          en: 'Religious',
          ml: 'മതപരമായ',
        },
        {
          id: 'opt4',
          type: 'text',
          en: 'Scheduled Caste',
          ml: 'ഷെഡ്യൂൾഡ് കാസ്റ്റ്',
        },
      ],
      explanation: {
        en: 'The Indian census recognizes tribal, religious, and scheduled caste groups, but does not recognize ethnic groups.',
        ml: 'ഇന്ത്യൻ സെൻസസ് ആദിവാസി, മതപരമായ, ഷെഡ്യൂൾഡ് ജാതി ഗ്രൂപ്പുകളെ അംഗീകരിക്കുന്നു',
        image: null,
      },
      correctAnswer: 'opt2',
      subject: '67bcc50e2327dfe9f05f8eda',
      difficultyLevel: 'easy',
    },
    {
      _id: '67d8437e7fe6a06f93b710b2',
      questionText: {
        en: {
          text: 'What is the capital of India?',
          image: null,
        },
        ml: {
          text: 'ഇന്ത്യയുടെ തലസ്ഥാനം എന്താണ്?',
          image: null,
        },
      },
      optionType: 'text',
      options: [
        {
          id: 'capital1',
          type: 'text',
          en: 'Mumbai',
          ml: 'മുംബൈ',
        },
        {
          id: 'capital2',
          type: 'text',
          en: 'New Delhi',
          ml: 'ന്യൂ ഡൽഹി',
        },
        {
          id: 'capital3',
          type: 'text',
          en: 'Kolkata',
          ml: 'കൊൽക്കത്ത',
        },
        {
          id: 'capital4',
          type: 'text',
          en: 'Chennai',
          ml: 'ചെന്നൈ',
        },
      ],
      explanation: {
        en: 'New Delhi is the capital of India.',
        ml: 'ന്യൂ ഡൽഹി ഇന്ത്യയുടെ തലസ്ഥാനമാണ്',
        image: null,
      },
      correctAnswer: 'capital2',
      subject: '67bcc50e2327dfe9f05f8eda',
      difficultyLevel: 'easy',
    },
    {
      _id: '67d682f4136480ebab273f82',
      questionText: {
        en: {
          text: 'Who is known as the Father of the Indian Constitution?',
          image: null,
        },
        ml: {
          text: 'ഇന്ത്യൻ ഭരണഘടനയുടെ പിതാവ് എന്നറിയപ്പെടുന്നത് ആരാണ്?',
          image: null,
        },
      },
      optionType: 'text',
      options: [
        {
          id: 'const1',
          type: 'text',
          en: 'Mahatma Gandhi',
          ml: 'മഹാത്മാഗാന്ധി',
        },
        {
          id: 'const2',
          type: 'text',
          en: 'B.R. Ambedkar',
          ml: 'ബി.ആർ. അംബേദ്കർ',
        },
        {
          id: 'const3',
          type: 'text',
          en: 'Jawaharlal Nehru',
          ml: 'ജവഹർലാൽ നെഹ്‌റു',
        },
        {
          id: 'const4',
          type: 'text',
          en: 'Sardar Patel',
          ml: 'സർദാർ പട്ടേൽ',
        },
      ],
      explanation: {
        en: 'Dr. B.R. Ambedkar is known as the Father of the Indian Constitution.',
        ml: 'ഡോ. ബി.ആർ. അംബേദ്കറെ ഇന്ത്യൻ ഭരണഘടനയുടെ പിതാവ് എന്ന് വിളിക്കുന്നു',
        image: null,
      },
      correctAnswer: 'const2',
      subject: '67bcc50e2327dfe9f05f8eda',
      difficultyLevel: 'easy',
    },
    {
      _id: '67d67de9136480ebab273efb',
      questionText: {
        en: {
          text: 'What is 15% of 200?',
          image: null,
        },
        ml: {
          text: '200-ന്റെ 15% എത്രയാണ്?',
          image: null,
        },
      },
      optionType: 'text',
      options: [
        {
          id: 'percent1',
          type: 'text',
          en: '25',
          ml: '25',
        },
        {
          id: 'percent2',
          type: 'text',
          en: '30',
          ml: '30',
        },
        {
          id: 'percent3',
          type: 'text',
          en: '35',
          ml: '35',
        },
        {
          id: 'percent4',
          type: 'text',
          en: '40',
          ml: '40',
        },
      ],
      explanation: {
        en: '15% of 200 = (15/100) × 200 = 30',
        ml: '200-ന്റെ 15% = (15/100) × 200 = 30',
        image: null,
      },
      correctAnswer: 'percent2',
      subject: '67bcc413003af8ad9fae3585',
      difficultyLevel: 'easy',
    },
    {
      _id: '67cb34f610de63dd6317533b',
      questionText: {
        en: {
          text: 'If a train travels 120 km in 2 hours, what is its average speed?',
          image: null,
        },
        ml: {
          text: 'ഒരു ട്രെയിൻ 2 മണിക്കൂറിൽ 120 കി.മീ സഞ്ചരിക്കുന്നുവെങ്കിൽ, അതിന്റെ ശരാശരി വേഗത എത്രയാണ്?',
          image: null,
        },
      },
      optionType: 'text',
      options: [
        {
          id: 'speed1',
          type: 'text',
          en: '50 km/h',
          ml: '50 കി.മീ/മണിക്കൂർ',
        },
        {
          id: 'speed2',
          type: 'text',
          en: '55 km/h',
          ml: '55 കി.മീ/മണിക്കൂർ',
        },
        {
          id: 'speed3',
          type: 'text',
          en: '60 km/h',
          ml: '60 കി.മീ/മണിക്കൂർ',
        },
        {
          id: 'speed4',
          type: 'text',
          en: '65 km/h',
          ml: '65 കി.മീ/മണിക്കൂർ',
        },
      ],
      explanation: {
        en: 'Average speed = Distance / Time = 120 / 2 = 60 km/h',
        ml: 'ശരാശരി വേഗത = ദൂരം / സമയം = 120 / 2 = 60 കി.മീ/മണിക്കൂർ',
        image: null,
      },
      correctAnswer: 'speed3',
      subject: '67bcc413003af8ad9fae3585',
      difficultyLevel: 'medium',
    },
    {
      _id: '67c5f71b2548058025b23457',
      questionText: {
        en: {
          text: 'Which planet is known as the Red Planet?',
          image: null,
        },
        ml: {
          text: 'ചുവന്ന ഗ്രഹം എന്നറിയപ്പെടുന്നത് ഏത് ഗ്രഹമാണ്?',
          image: null,
        },
      },
      optionType: 'text',
      options: [
        {
          id: 'planet1',
          type: 'text',
          en: 'Venus',
          ml: 'ശുക്രൻ',
        },
        {
          id: 'planet2',
          type: 'text',
          en: 'Mars',
          ml: 'ചൊവ്വ',
        },
        {
          id: 'planet3',
          type: 'text',
          en: 'Jupiter',
          ml: 'വ്യാഴം',
        },
        {
          id: 'planet4',
          type: 'text',
          en: 'Saturn',
          ml: 'ശനി',
        },
      ],
      explanation: {
        en: 'Mars is known as the Red Planet due to its reddish appearance.',
        ml: 'ചുവപ്പ് നിറമുള്ളതിനാൽ ചൊവ്വയെ ചുവന്ന ഗ്രഹം എന്ന് വിളിക്കുന്നു',
        image: null,
      },
      correctAnswer: 'planet2',
      subject: '67bcc50e2327dfe9f05f8eda',
      difficultyLevel: 'easy',
    },
    {
      _id: '67c5f5b62548058025b23418',
      questionText: {
        en: {
          text: 'What is the square root of 144?',
          image: null,
        },
        ml: {
          text: '144-ന്റെ വർഗ്ഗമൂലം എത്രയാണ്?',
          image: null,
        },
      },
      optionType: 'text',
      options: [
        {
          id: 'sqrt1',
          type: 'text',
          en: '10',
          ml: '10',
        },
        {
          id: 'sqrt2',
          type: 'text',
          en: '11',
          ml: '11',
        },
        {
          id: 'sqrt3',
          type: 'text',
          en: '12',
          ml: '12',
        },
        {
          id: 'sqrt4',
          type: 'text',
          en: '13',
          ml: '13',
        },
      ],
      explanation: {
        en: 'The square root of 144 is 12 because 12 × 12 = 144',
        ml: '144-ന്റെ വർഗ്ഗമൂലം 12 ആണ് കാരണം 12 × 12 = 144',
        image: null,
      },
      correctAnswer: 'sqrt3',
      subject: '67bcc413003af8ad9fae3585',
      difficultyLevel: 'easy',
    },
    {
      _id: '67d84f7825df3f32a2821ca9',
      questionText: {
        en: {
          text: 'In which year did India gain independence?',
          image: null,
        },
        ml: {
          text: 'ഇന്ത്യക്ക് സ്വാതന്ത്ര്യം ലഭിച്ചത് ഏത് വർഷമാണ്?',
          image: null,
        },
      },
      optionType: 'text',
      options: [
        {
          id: 'year1',
          type: 'text',
          en: '1942',
          ml: '1942',
        },
        {
          id: 'year2',
          type: 'text',
          en: '1945',
          ml: '1945',
        },
        {
          id: 'year3',
          type: 'text',
          en: '1947',
          ml: '1947',
        },
        {
          id: 'year4',
          type: 'text',
          en: '1950',
          ml: '1950',
        },
      ],
      explanation: {
        en: 'India gained independence on August 15, 1947.',
        ml: 'ഇന്ത്യക്ക് 1947 ഓഗസ്റ്റ് 15-ന് സ്വാതന്ത്ര്യം ലഭിച്ചു',
        image: null,
      },
      correctAnswer: 'year3',
      subject: '67bcc50e2327dfe9f05f8eda',
      difficultyLevel: 'easy',
    },
    {
      _id: '67d848fc43ed63820ea13643',
      questionText: {
        en: {
          text: 'If x + 5 = 12, what is the value of x?',
          image: null,
        },
        ml: {
          text: 'x + 5 = 12 ആണെങ്കിൽ, x-ന്റെ മൂല്യം എത്രയാണ്?',
          image: null,
        },
      },
      optionType: 'text',
      options: [
        {
          id: 'algebra1',
          type: 'text',
          en: '5',
          ml: '5',
        },
        {
          id: 'algebra2',
          type: 'text',
          en: '6',
          ml: '6',
        },
        {
          id: 'algebra3',
          type: 'text',
          en: '7',
          ml: '7',
        },
        {
          id: 'algebra4',
          type: 'text',
          en: '8',
          ml: '8',
        },
      ],
      explanation: {
        en: 'x + 5 = 12, therefore x = 12 - 5 = 7',
        ml: 'x + 5 = 12, അതിനാൽ x = 12 - 5 = 7',
        image: null,
      },
      correctAnswer: 'algebra3',
      subject: '67bcc413003af8ad9fae3585',
      difficultyLevel: 'easy',
    },
  ],
};
