import {
  PrismaClient,
  QuestionDifficulty,
  QuestionStatus,
  DailyQuizStatus,
  UserRole,
} from '@prisma/client';

const prisma = new PrismaClient();

const SUBJECTS = [
  { name: 'Anatomy', slug: 'anatomy', topics: ['Neuroanatomy', 'Cardiovascular Anatomy'] },
  { name: 'Physiology', slug: 'physiology', topics: ['Cardiovascular Physiology'] },
  { name: 'Pathology', slug: 'pathology', topics: ['General Pathology'] },
  { name: 'Pharmacology', slug: 'pharmacology', topics: ['Autonomic Pharmacology'] },
  { name: 'Medicine', slug: 'medicine', topics: ['Cardiology', 'Neurology'] },
];

const SAMPLE_QUESTIONS = [
  {
    topicSlug: 'neuroanatomy',
    stem: 'Which cranial nerve supplies the lateral rectus muscle?',
    explanation:
      'The abducens nerve (CN VI) innervates the lateral rectus muscle, which abducts the eye.',
    clinicalPearl: 'CN VI has the longest intracranial course and is vulnerable in raised ICP.',
    memoryTrick: 'LR6 — Lateral Rectus = CN 6',
    options: [
      { label: 'A', text: 'CN III', isCorrect: false },
      { label: 'B', text: 'CN IV', isCorrect: false },
      { label: 'C', text: 'CN VI', isCorrect: true },
      { label: 'D', text: 'CN VII', isCorrect: false },
    ],
  },
  {
    topicSlug: 'cardiology',
    stem: 'Which murmur is best heard at the apex with the patient in left lateral decubitus position?',
    explanation:
      'Mitral stenosis produces a diastolic murmur best heard at the apex in left lateral decubitus.',
    clinicalPearl: 'Opening snap after S2 is pathognomonic for mitral stenosis.',
    memoryTrick: 'MS at the Mitral (apex) — think "Mitral Stenosis"',
    options: [
      { label: 'A', text: 'Aortic stenosis', isCorrect: false },
      { label: 'B', text: 'Mitral stenosis', isCorrect: true },
      { label: 'C', text: 'Pulmonary stenosis', isCorrect: false },
      { label: 'D', text: 'Tricuspid regurgitation', isCorrect: false },
    ],
  },
  {
    topicSlug: 'cardiovascular-physiology',
    stem: 'What is the primary determinant of cardiac output?',
    explanation: 'Cardiac output = Stroke Volume × Heart Rate. SV is the primary determinant.',
    clinicalPearl: 'CO increases primarily via increased SV during exercise.',
    memoryTrick: 'CO = SV × HR — "Stroke Starts the Pump"',
    options: [
      { label: 'A', text: 'Blood viscosity', isCorrect: false },
      { label: 'B', text: 'Stroke volume', isCorrect: true },
      { label: 'C', text: 'Vascular resistance', isCorrect: false },
      { label: 'D', text: 'Plasma osmolality', isCorrect: false },
    ],
  },
  {
    topicSlug: 'general-pathology',
    stem: 'Apoptosis is characterized by which of the following?',
    explanation:
      'Apoptosis is programmed cell death with cell shrinkage, chromatin condensation, and no inflammation.',
    clinicalPearl: 'Caspases are the executioners of apoptosis.',
    memoryTrick: 'Apoptosis = "A programmed exit" — no inflammation',
    options: [
      { label: 'A', text: 'Cell swelling and inflammation', isCorrect: false },
      { label: 'B', text: 'Chromatin condensation without inflammation', isCorrect: true },
      { label: 'C', text: 'Release of DAMPs', isCorrect: false },
      { label: 'D', text: 'Karyorrhexis with acute inflammation', isCorrect: false },
    ],
  },
  {
    topicSlug: 'autonomic-pharmacology',
    stem: 'Which drug is a selective beta-1 adrenergic blocker?',
    explanation: 'Atenolol is cardioselective (beta-1) and commonly used in hypertension and angina.',
    clinicalPearl: 'Cardioselectivity is lost at higher doses.',
    memoryTrick: 'Atenolol = "A" for Atrium (beta-1)',
    options: [
      { label: 'A', text: 'Propranolol', isCorrect: false },
      { label: 'B', text: 'Atenolol', isCorrect: true },
      { label: 'C', text: 'Labetalol', isCorrect: false },
      { label: 'D', text: 'Carvedilol', isCorrect: false },
    ],
  },
  {
    topicSlug: 'neurology',
    stem: 'Which sign is characteristic of upper motor neuron lesion?',
    explanation: 'UMN lesions cause spasticity, hyperreflexia, and positive Babinski sign.',
    clinicalPearl: 'Babinski positive = UMN lesion (adult).',
    memoryTrick: 'UMN = "Up" reflexes, Babinski positive',
    options: [
      { label: 'A', text: 'Flaccid paralysis', isCorrect: false },
      { label: 'B', text: 'Hyporeflexia', isCorrect: false },
      { label: 'C', text: 'Positive Babinski sign', isCorrect: true },
      { label: 'D', text: 'Fasciculations', isCorrect: false },
    ],
  },
  {
    topicSlug: 'cardiovascular-anatomy',
    stem: 'The coronary sinus drains into which chamber?',
    explanation: 'The coronary sinus opens into the right atrium.',
    clinicalPearl: 'Coronary sinus is the largest vein of the heart.',
    memoryTrick: 'Coronary Sinus → Right Atrium (CSR)',
    options: [
      { label: 'A', text: 'Right atrium', isCorrect: true },
      { label: 'B', text: 'Left atrium', isCorrect: false },
      { label: 'C', text: 'Right ventricle', isCorrect: false },
      { label: 'D', text: 'Left ventricle', isCorrect: false },
    ],
  },
  {
    topicSlug: 'neuroanatomy',
    stem: 'Which artery supplies the posterior inferior cerebellum?',
    explanation: 'PICA (Posterior Inferior Cerebellar Artery) supplies the inferior cerebellum.',
    clinicalPearl: 'PICA occlusion causes lateral medullary (Wallenberg) syndrome.',
    memoryTrick: 'PICA = Posterior Inferior Cerebellar Artery',
    options: [
      { label: 'A', text: 'AICA', isCorrect: false },
      { label: 'B', text: 'PICA', isCorrect: true },
      { label: 'C', text: 'SCA', isCorrect: false },
      { label: 'D', text: 'Basilar artery', isCorrect: false },
    ],
  },
  {
    topicSlug: 'cardiology',
    stem: 'ST elevation in leads II, III, and aVF indicates infarction of which wall?',
    explanation: 'Inferior wall MI shows ST elevation in II, III, aVF.',
    clinicalPearl: 'Check right-sided leads (V4R) for RV involvement.',
    memoryTrick: 'II, III, aVF = Inferior (foot leads = bottom of heart)',
    options: [
      { label: 'A', text: 'Anterior', isCorrect: false },
      { label: 'B', text: 'Inferior', isCorrect: true },
      { label: 'C', text: 'Lateral', isCorrect: false },
      { label: 'D', text: 'Septal', isCorrect: false },
    ],
  },
  {
    topicSlug: 'general-pathology',
    stem: 'Granulomatous inflammation is most characteristic of which organism?',
    explanation: 'Mycobacterium tuberculosis causes caseating granulomas.',
    clinicalPearl: 'Langhans giant cells are seen in TB granulomas.',
    memoryTrick: 'TB = caseating granulomas',
    options: [
      { label: 'A', text: 'Streptococcus pyogenes', isCorrect: false },
      { label: 'B', text: 'Mycobacterium tuberculosis', isCorrect: true },
      { label: 'C', text: 'Escherichia coli', isCorrect: false },
      { label: 'D', text: 'Candida albicans', isCorrect: false },
    ],
  },
];

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-');
}

async function main() {
  console.log('Seeding database...');

  const faculty = await prisma.user.upsert({
    where: { firebaseUid: 'seed-faculty-uid' },
    update: {},
    create: {
      firebaseUid: 'seed-faculty-uid',
      name: 'Dr. Faculty',
      email: 'faculty@dbmci.com',
      role: UserRole.faculty,
    },
  });

  const student = await prisma.user.upsert({
    where: { firebaseUid: 'seed-student-uid' },
    update: {},
    create: {
      firebaseUid: 'seed-student-uid',
      name: 'Sameer',
      email: 'sameer@example.com',
      role: UserRole.student,
    },
  });

  await prisma.userStreak.upsert({
    where: { userId: student.id },
    update: {},
    create: { userId: student.id, currentStreak: 0, longestStreak: 0 },
  });

  await prisma.notificationPreference.upsert({
    where: { userId: student.id },
    update: {},
    create: { userId: student.id },
  });

  const topicMap = new Map<string, string>();

  for (const subject of SUBJECTS) {
    const createdSubject = await prisma.subject.upsert({
      where: { slug: subject.slug },
      update: {},
      create: {
        name: subject.name,
        slug: subject.slug,
        displayOrder: SUBJECTS.indexOf(subject),
      },
    });

    for (const topicName of subject.topics) {
      const slug = slugify(topicName);
      const topic = await prisma.topic.upsert({
        where: { subjectId_slug: { subjectId: createdSubject.id, slug } },
        update: {},
        create: {
          subjectId: createdSubject.id,
          name: topicName,
          slug,
        },
      });
      topicMap.set(slug, topic.id);
    }
  }

  const questionIds: string[] = [];

  for (const q of SAMPLE_QUESTIONS) {
    const topicId = topicMap.get(q.topicSlug);
    if (!topicId) {
      console.warn(`Topic not found: ${q.topicSlug}`);
      continue;
    }

    const existing = await prisma.question.findFirst({
      where: { stem: q.stem },
    });

    if (existing) {
      questionIds.push(existing.id);
      continue;
    }

    const question = await prisma.question.create({
      data: {
        topicId,
        stem: q.stem,
        explanation: q.explanation,
        clinicalPearl: q.clinicalPearl,
        memoryTrick: q.memoryTrick,
        difficulty: QuestionDifficulty.medium,
        status: QuestionStatus.published,
        createdById: faculty.id,
        options: {
          create: q.options,
        },
      },
    });
    questionIds.push(question.id);
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const dailyQuiz = await prisma.dailyQuiz.upsert({
    where: { quizDate: today },
    update: {},
    create: {
      quizDate: today,
      title: `Daily Quiz — ${today.toISOString().split('T')[0]}`,
      status: DailyQuizStatus.published,
      publishedAt: new Date(),
      createdById: faculty.id,
      questions: {
        create: questionIds.slice(0, 10).map((questionId, index) => ({
          questionId,
          position: index + 1,
        })),
      },
    },
  });

  console.log(`Seeded faculty: ${faculty.name}`);
  console.log(`Seeded student: ${student.name}`);
  console.log(`Seeded ${questionIds.length} questions`);
  console.log(`Seeded daily quiz: ${dailyQuiz.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
