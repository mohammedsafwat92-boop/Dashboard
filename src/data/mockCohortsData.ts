import { CohortSummary, Trainee, RubricBreakdown } from '../types';

export const DEFAULT_SHEET_NAMES = [
  'Cohort 1',
  'Cohort 2',
  'Cohort 3',
  'Cohort 4',
  'Cohort 5',
  'Cohort 6',
];

interface RawTraineeInput {
  name: string;
  email: string;
  role: string;
  rp1: number;
  rp2: number;
  rp3: number;
  rp4: number;
  rp5: number;
  tBase: number;
  t1: number;
  t2: number;
  t3: number;
  tFinal: number;
  comm: number;
  prod: number;
  listen: number;
  obj: number;
  ctrl: number;
  notes: string;
  recs: string[];
}

function buildCohort(
  sheetIndex: number,
  name: string,
  code: string,
  tabName: string,
  trainer: string,
  startDate: string,
  endDate: string,
  rawList: RawTraineeInput[]
): CohortSummary {
  const trainees: Trainee[] = rawList.map((item, idx) => {
    const rpAvg = Math.round(
      (item.rp1 + item.rp2 + item.rp3 + item.rp4 + item.rp5) / 5
    );
    const testAvg = Math.round(
      (item.tBase + item.t1 + item.t2 + item.t3 + item.tFinal) / 5
    );
    const overall = Math.round(rpAvg * 0.5 + testAvg * 0.5);

    let status: Trainee['status'] = 'Ready';
    if (overall < 70 || rpAvg < 65 || testAvg < 65) {
      status = 'Remediation Needed';
    } else if (overall < 76 || rpAvg < 72 || testAvg < 72) {
      status = 'At Risk';
    } else if (overall < 84) {
      status = 'On Track';
    } else {
      status = 'Ready';
    }

    const rpPass =
      rpAvg >= 75 ? 'Pass' : rpAvg >= 68 ? 'Borderline' : 'Remediate';
    const testPass =
      testAvg >= 80 ? 'Certified' : testAvg >= 72 ? 'Passed' : 'Retake Required';

    return {
      id: `${code}-T${String(idx + 1).padStart(2, '0')}`,
      name: item.name,
      email: item.email,
      cohortId: code,
      cohortName: name,
      trainer,
      role: item.role,
      startDate,
      completionDate: endDate,
      overallScore: overall,
      status,
      roleplays: {
        rp1Discovery: item.rp1,
        rp2Objection: item.rp2,
        rp3ValuePitch: item.rp3,
        rp4Deescalation: item.rp4,
        rp5Closing: item.rp5,
        average: rpAvg,
        passStatus: rpPass,
        rubric: {
          communication: item.comm,
          productKnowledge: item.prod,
          activeListening: item.listen,
          objectionHandling: item.obj,
          callControl: item.ctrl,
        },
        evaluatorNotes: item.notes,
      },
      tests: {
        baselineTest: item.tBase,
        module1Test: item.t1,
        module2Test: item.t2,
        module3Test: item.t3,
        finalExam: item.tFinal,
        average: testAvg,
        passStatus: testPass,
        attemptsCount: testAvg < 75 ? 2 : 1,
      },
      recommendations: item.recs,
    };
  });

  const count = trainees.length;
  const avgRoleplayScore = Math.round(
    trainees.reduce((acc, t) => acc + t.roleplays.average, 0) / count
  );
  const avgTestScore = Math.round(
    trainees.reduce((acc, t) => acc + t.tests.average, 0) / count
  );
  const avgOverallScore = Math.round(
    trainees.reduce((acc, t) => acc + t.overallScore, 0) / count
  );

  const roleplayPassRate = Math.round(
    (trainees.filter((t) => t.roleplays.average >= 75).length / count) * 100
  );
  const testPassRate = Math.round(
    (trainees.filter((t) => t.tests.average >= 75).length / count) * 100
  );
  const certificationRate = Math.round(
    (trainees.filter((t) => t.status === 'Ready' || (t.overallScore >= 80 && t.roleplays.average >= 75 && t.tests.average >= 75)).length / count) * 100
  );
  const atRiskCount = trainees.filter(
    (t) => t.status === 'At Risk' || t.status === 'Remediation Needed'
  ).length;

  const topSorted = [...trainees].sort((a, b) => b.overallScore - a.overallScore);
  const topPerformer = {
    name: topSorted[0]?.name || 'N/A',
    score: topSorted[0]?.overallScore || 0,
  };

  const rubricAverages: RubricBreakdown = {
    communication: Math.round(
      trainees.reduce((acc, t) => acc + t.roleplays.rubric.communication, 0) / count
    ),
    productKnowledge: Math.round(
      trainees.reduce((acc, t) => acc + t.roleplays.rubric.productKnowledge, 0) / count
    ),
    activeListening: Math.round(
      trainees.reduce((acc, t) => acc + t.roleplays.rubric.activeListening, 0) / count
    ),
    objectionHandling: Math.round(
      trainees.reduce((acc, t) => acc + t.roleplays.rubric.objectionHandling, 0) / count
    ),
    callControl: Math.round(
      trainees.reduce((acc, t) => acc + t.roleplays.rubric.callControl, 0) / count
    ),
  };

  const roleplayAverages = {
    rp1Discovery: Math.round(
      trainees.reduce((acc, t) => acc + t.roleplays.rp1Discovery, 0) / count
    ),
    rp2Objection: Math.round(
      trainees.reduce((acc, t) => acc + t.roleplays.rp2Objection, 0) / count
    ),
    rp3ValuePitch: Math.round(
      trainees.reduce((acc, t) => acc + t.roleplays.rp3ValuePitch, 0) / count
    ),
    rp4Deescalation: Math.round(
      trainees.reduce((acc, t) => acc + t.roleplays.rp4Deescalation, 0) / count
    ),
    rp5Closing: Math.round(
      trainees.reduce((acc, t) => acc + t.roleplays.rp5Closing, 0) / count
    ),
  };

  const testAverages = {
    baselineTest: Math.round(
      trainees.reduce((acc, t) => acc + t.tests.baselineTest, 0) / count
    ),
    module1Test: Math.round(
      trainees.reduce((acc, t) => acc + t.tests.module1Test, 0) / count
    ),
    module2Test: Math.round(
      trainees.reduce((acc, t) => acc + t.tests.module2Test, 0) / count
    ),
    module3Test: Math.round(
      trainees.reduce((acc, t) => acc + t.tests.module3Test, 0) / count
    ),
    finalExam: Math.round(
      trainees.reduce((acc, t) => acc + t.tests.finalExam, 0) / count
    ),
  };

  return {
    id: `cohort-${sheetIndex}`,
    sheetIndex,
    name,
    code,
    tabName,
    trainer,
    traineeCount: count,
    startDate,
    endDate,
    avgRoleplayScore,
    avgTestScore,
    avgOverallScore,
    roleplayPassRate,
    testPassRate,
    certificationRate,
    atRiskCount,
    topPerformer,
    rubricAverages,
    roleplayAverages,
    testAverages,
    trainees,
  };
}

export const INITIAL_COHORTS_DATA: CohortSummary[] = [
  // Sheet 1: Cohort 1 - Alpha Vanguard
  buildCohort(
    1,
    'Cohort 1 - Alpha Vanguard',
    'C1',
    'Cohort 1',
    'Sarah Jenkins',
    '2026-01-12',
    '2026-02-13',
    [
      {
        name: 'Jordan Hayes',
        email: 'jordan.h@company.com',
        role: 'Account Executive',
        rp1: 82, rp2: 74, rp3: 79, rp4: 85, rp5: 78,
        tBase: 65, t1: 84, t2: 80, t3: 88, tFinal: 86,
        comm: 84, prod: 82, listen: 80, obj: 72, ctrl: 81,
        notes: 'Good presence, needs smoother transition when handling pricing objections.',
        recs: ['Review competitor comparison deck', 'Practice pause-before-answer in pricing talks']
      },
      {
        name: 'Amina Al-Mansoor',
        email: 'amina.m@company.com',
        role: 'Commercial SDR',
        rp1: 88, rp2: 81, rp3: 85, rp4: 90, rp5: 84,
        tBase: 72, t1: 91, t2: 86, t3: 92, tFinal: 90,
        comm: 89, prod: 88, listen: 91, obj: 83, ctrl: 86,
        notes: 'Outstanding discovery instincts; questions unearth genuine business pain.',
        recs: ['Candidate for senior mentor role', 'Deepen advanced security compliance questions']
      },
      {
        name: 'Liam O’Connor',
        email: 'liam.oc@company.com',
        role: 'Sales Engineer',
        rp1: 76, rp2: 68, rp3: 82, rp4: 70, rp5: 72,
        tBase: 78, t1: 94, t2: 89, t3: 90, tFinal: 92,
        comm: 72, prod: 96, listen: 68, obj: 66, ctrl: 70,
        notes: 'Brilliant technical knowledge but talks over customer during objection phase.',
        recs: ['Run 3 mock calls focusing purely on active listening', 'Limit monologue to 90 seconds']
      },
      {
        name: 'Chloe Tremblay',
        email: 'chloe.t@company.com',
        role: 'Account Executive',
        rp1: 70, rp2: 64, rp3: 72, rp4: 68, rp5: 65,
        tBase: 58, t1: 74, t2: 70, t3: 72, tFinal: 73,
        comm: 70, prod: 69, listen: 68, obj: 62, ctrl: 65,
        notes: 'Struggles when prospect pushes back on contract terms.',
        recs: ['Assigned peer pairing with Amina', 'Remediation on negotiation module']
      },
      {
        name: 'Mateo Rossi',
        email: 'mateo.r@company.com',
        role: 'Customer Success',
        rp1: 85, rp2: 79, rp3: 80, rp4: 92, rp5: 77,
        tBase: 68, t1: 86, t2: 84, t3: 85, tFinal: 87,
        comm: 88, prod: 83, listen: 89, obj: 78, ctrl: 82,
        notes: 'Natural de-escalation capability. Empathetic tone calms frustrated stakeholders.',
        recs: ['Standardize his de-escalation playbook as a team example']
      },
      {
        name: 'Maya Lin',
        email: 'maya.l@company.com',
        role: 'Enterprise SDR',
        rp1: 79, rp2: 72, rp3: 75, rp4: 80, rp5: 71,
        tBase: 62, t1: 80, t2: 78, t3: 81, tFinal: 80,
        comm: 78, prod: 77, listen: 76, obj: 70, ctrl: 74,
        notes: 'Consistent worker, improving on each iteration.',
        recs: ['Focus on multi-threading discovery questions']
      },
      {
        name: 'Carlos Santana',
        email: 'carlos.s@company.com',
        role: 'Account Executive',
        rp1: 74, rp2: 66, rp3: 71, rp4: 73, rp5: 68,
        tBase: 60, t1: 76, t2: 72, t3: 75, tFinal: 74,
        comm: 73, prod: 72, listen: 70, obj: 64, ctrl: 69,
        notes: 'Hesitant in closing commitment questions.',
        recs: ['Work on clear call-to-actions at call ending']
      },
      {
        name: 'Zoe Becker',
        email: 'zoe.b@company.com',
        role: 'Sales Engineer',
        rp1: 80, rp2: 71, rp3: 84, rp4: 76, rp5: 75,
        tBase: 70, t1: 89, t2: 85, t3: 87, tFinal: 88,
        comm: 79, prod: 90, listen: 77, obj: 72, ctrl: 76,
        notes: 'Solid overall technical demonstrations.',
        recs: ['Add business ROI framing to architecture walkthrough']
      }
    ]
  ),

  // Sheet 2: Cohort 2 - Beta Pioneers
  buildCohort(
    2,
    'Cohort 2 - Beta Pioneers',
    'C2',
    'Cohort 2',
    'Marcus Vance',
    '2026-02-16',
    '2026-03-20',
    [
      {
        name: 'Derrick Vance Jr.',
        email: 'derrick.v@company.com',
        role: 'Account Executive',
        rp1: 86, rp2: 82, rp3: 88, rp4: 84, rp5: 86,
        tBase: 71, t1: 88, t2: 85, t3: 90, tFinal: 89,
        comm: 87, prod: 86, listen: 85, obj: 83, ctrl: 87,
        notes: 'Excellent structure and pacing throughout all simulated client interactions.',
        recs: ['Fast-track to live pipeline calls']
      },
      {
        name: 'Sophie Laurent',
        email: 'sophie.l@company.com',
        role: 'Commercial SDR',
        rp1: 91, rp2: 84, rp3: 86, rp4: 88, rp5: 83,
        tBase: 74, t1: 92, t2: 88, t3: 91, tFinal: 91,
        comm: 92, prod: 87, listen: 93, obj: 84, ctrl: 88,
        notes: 'Masterful discovery probing. Converts initial cold friction into engaging dialogue.',
        recs: ['Review enterprise complex buying committee playbook']
      },
      {
        name: 'Kenji Takahashi',
        email: 'kenji.t@company.com',
        role: 'Sales Engineer',
        rp1: 80, rp2: 75, rp3: 89, rp4: 79, rp5: 78,
        tBase: 79, t1: 96, t2: 91, t3: 94, tFinal: 95,
        comm: 79, prod: 97, listen: 78, obj: 76, ctrl: 80,
        notes: 'Flawless product knowledge; improving conversational storytelling during demos.',
        recs: ['Translate technical specs into CFO-level financial impacts']
      },
      {
        name: 'Fatima Zahra',
        email: 'fatima.z@company.com',
        role: 'Customer Success',
        rp1: 87, rp2: 80, rp3: 82, rp4: 94, rp5: 81,
        tBase: 70, t1: 87, t2: 86, t3: 89, tFinal: 88,
        comm: 90, prod: 84, listen: 92, obj: 81, ctrl: 86,
        notes: 'High empathy, handles escalations with poise and clear resolution timelines.',
        recs: ['Develop proactive risk identification workflows']
      },
      {
        name: 'Lucas Meyer',
        email: 'lucas.m@company.com',
        role: 'Account Executive',
        rp1: 78, rp2: 71, rp3: 79, rp4: 75, rp5: 76,
        tBase: 65, t1: 82, t2: 79, t3: 83, tFinal: 81,
        comm: 79, prod: 80, listen: 76, obj: 72, ctrl: 78,
        notes: 'Good progress between RP1 and RP5. Retains feedback quickly.',
        recs: ['Focus on framing mutual action plans earlier']
      },
      {
        name: 'Tanya Patel',
        email: 'tanya.p@company.com',
        role: 'Enterprise SDR',
        rp1: 84, rp2: 78, rp3: 80, rp4: 82, rp5: 79,
        tBase: 69, t1: 85, t2: 82, t3: 86, tFinal: 85,
        comm: 83, prod: 82, listen: 84, obj: 78, ctrl: 81,
        notes: 'Great at phone outreach and email cadence follow-ups.',
        recs: ['Practice LinkedIn executive messaging nuances']
      },
      {
        name: 'Andre Silva',
        email: 'andre.s@company.com',
        role: 'Account Executive',
        rp1: 72, rp2: 67, rp3: 73, rp4: 71, rp5: 69,
        tBase: 61, t1: 76, t2: 74, t3: 77, tFinal: 75,
        comm: 74, prod: 73, listen: 71, obj: 65, ctrl: 70,
        notes: 'Shows hesitation when pricing budget constraints are brought up.',
        recs: ['Additional sparring session with coach on pricing matrix']
      },
      {
        name: 'Rachel Green',
        email: 'rachel.g@company.com',
        role: 'Sales Engineer',
        rp1: 83, rp2: 77, rp3: 87, rp4: 80, rp5: 80,
        tBase: 75, t1: 91, t2: 87, t3: 90, tFinal: 90,
        comm: 82, prod: 92, listen: 81, obj: 78, ctrl: 82,
        notes: 'Articulate architecture diagrams and cloud migration arguments.',
        recs: ['Ready for client shadow rotations']
      }
    ]
  ),

  // Sheet 3: Cohort 3 - Gamma Apex
  buildCohort(
    3,
    'Cohort 3 - Gamma Apex',
    'C3',
    'Cohort 3',
    'Elena Rostova',
    '2026-03-23',
    '2026-04-24',
    [
      {
        name: 'Nolan Scott',
        email: 'nolan.s@company.com',
        role: 'Solutions Architect',
        rp1: 85, rp2: 79, rp3: 91, rp4: 82, rp5: 84,
        tBase: 82, t1: 98, t2: 95, t3: 96, tFinal: 97,
        comm: 84, prod: 98, listen: 82, obj: 80, ctrl: 85,
        notes: 'Sets the gold standard for solution walkthroughs and API compatibility deep-dives.',
        recs: ['Mentor cohort 4 and 5 junior architects']
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sh@company.com',
        role: 'Account Executive',
        rp1: 89, rp2: 85, rp3: 88, rp4: 89, rp5: 87,
        tBase: 76, t1: 93, t2: 90, t3: 92, tFinal: 93,
        comm: 91, prod: 89, listen: 92, obj: 86, ctrl: 89,
        notes: 'High EQ combined with disciplined qualification methodology (MEDDPICC).',
        recs: ['Assign high-value enterprise accounts upon graduation']
      },
      {
        name: 'Marcus Brody',
        email: 'marcus.b@company.com',
        role: 'Technical Consultant',
        rp1: 79, rp2: 73, rp3: 85, rp4: 78, rp5: 75,
        tBase: 77, t1: 94, t2: 88, t3: 91, tFinal: 92,
        comm: 77, prod: 95, listen: 76, obj: 73, ctrl: 78,
        notes: 'High knowledge retention; work on slowing down speech during technical crisis.',
        recs: ['Practice breathing pacing during high-pressure questions']
      },
      {
        name: 'Elena Gomez',
        email: 'elena.g@company.com',
        role: 'Customer Success',
        rp1: 86, rp2: 82, rp3: 84, rp4: 93, rp5: 83,
        tBase: 73, t1: 89, t2: 87, t3: 90, tFinal: 89,
        comm: 91, prod: 86, listen: 93, obj: 83, ctrl: 87,
        notes: 'Superb customer de-escalation skills; handles contractual friction smoothly.',
        recs: ['Review renewal expansion conversation playbooks']
      },
      {
        name: 'Samuel Adebayo',
        email: 'samuel.a@company.com',
        role: 'Account Executive',
        rp1: 81, rp2: 76, rp3: 80, rp4: 79, rp5: 82,
        tBase: 68, t1: 85, t2: 83, t3: 87, tFinal: 86,
        comm: 83, prod: 82, listen: 81, obj: 78, ctrl: 82,
        notes: 'Confident closer. Uses effective time-bounded concessions.',
        recs: ['Reinforce discovery notes documentation in CRM']
      },
      {
        name: 'Hannah Abbott',
        email: 'hannah.a@company.com',
        role: 'Commercial SDR',
        rp1: 83, rp2: 75, rp3: 81, rp4: 80, rp5: 77,
        tBase: 67, t1: 84, t2: 80, t3: 85, tFinal: 83,
        comm: 84, prod: 81, listen: 82, obj: 76, ctrl: 80,
        notes: 'Strong cold calling confidence, great energy.',
        recs: ['Focus on multi-threading accounts with multiple buyer personas']
      },
      {
        name: 'Dmitri Volkov',
        email: 'dmitri.v@company.com',
        role: 'Account Executive',
        rp1: 75, rp2: 69, rp3: 74, rp4: 72, rp5: 71,
        tBase: 64, t1: 79, t2: 76, t3: 80, tFinal: 78,
        comm: 76, prod: 76, listen: 73, obj: 68, ctrl: 73,
        notes: 'Accepts feedback well, but needs practice on competitive differentiation.',
        recs: ['Review battlecards on top 3 competitors']
      },
      {
        name: 'Grace Kim',
        email: 'grace.k@company.com',
        role: 'Sales Engineer',
        rp1: 84, rp2: 78, rp3: 89, rp4: 81, rp5: 82,
        tBase: 78, t1: 93, t2: 89, t3: 92, tFinal: 92,
        comm: 84, prod: 93, listen: 83, obj: 79, ctrl: 84,
        notes: 'Clear communication of complex cloud architectures.',
        recs: ['Deliver mock demo to executive sales leadership']
      }
    ]
  ),

  // Sheet 4: Cohort 4 - Delta Force
  buildCohort(
    4,
    'Cohort 4 - Delta Force',
    'C4',
    'Cohort 4',
    'David Kim',
    '2026-05-04',
    '2026-06-05',
    [
      {
        name: 'Victor Vance',
        email: 'victor.v@company.com',
        role: 'Account Executive',
        rp1: 87, rp2: 83, rp3: 86, rp4: 85, rp5: 88,
        tBase: 73, t1: 89, t2: 87, t3: 91, tFinal: 90,
        comm: 88, prod: 87, listen: 86, obj: 85, ctrl: 88,
        notes: 'Top tier negotiation and closing confidence. Excellent objection handling.',
        recs: ['Accelerated graduation approved']
      },
      {
        name: 'Mei-Ling Zhou',
        email: 'meiling.z@company.com',
        role: 'Enterprise SDR',
        rp1: 90, rp2: 86, rp3: 88, rp4: 89, rp5: 85,
        tBase: 76, t1: 93, t2: 90, t3: 93, tFinal: 92,
        comm: 92, prod: 89, listen: 94, obj: 87, ctrl: 89,
        notes: 'Unbelievable customer empathy and sharp business acumen.',
        recs: ['Ready for tier 1 enterprise accounts']
      },
      {
        name: 'Javier Morales',
        email: 'javier.m@company.com',
        role: 'Customer Success',
        rp1: 84, rp2: 81, rp3: 83, rp4: 95, rp5: 82,
        tBase: 71, t1: 88, t2: 86, t3: 89, tFinal: 88,
        comm: 91, prod: 85, listen: 92, obj: 83, ctrl: 87,
        notes: 'Outstanding de-escalation; handles upset VIP clients with poise.',
        recs: ['Document his customer recovery script']
      },
      {
        name: 'Kavita Patel',
        email: 'kavita.p@company.com',
        role: 'Sales Engineer',
        rp1: 82, rp2: 77, rp3: 90, rp4: 81, rp5: 80,
        tBase: 80, t1: 95, t2: 92, t3: 94, tFinal: 95,
        comm: 82, prod: 96, listen: 80, obj: 78, ctrl: 83,
        notes: 'Strong technical delivery and API demo capability.',
        recs: ['Work on business outcome summaries before technical dive']
      },
      {
        name: 'Tyler Reed',
        email: 'tyler.r@company.com',
        role: 'Account Executive',
        rp1: 77, rp2: 70, rp3: 75, rp4: 74, rp5: 73,
        tBase: 63, t1: 80, t2: 77, t3: 81, tFinal: 79,
        comm: 78, prod: 77, listen: 75, obj: 70, ctrl: 75,
        notes: 'Needs more practice defending pricing without immediate discount offering.',
        recs: ['Concession strategy refresher session']
      },
      {
        name: 'Ananya Roy',
        email: 'ananya.r@company.com',
        role: 'Commercial SDR',
        rp1: 85, rp2: 80, rp3: 83, rp4: 84, rp5: 81,
        tBase: 72, t1: 87, t2: 84, t3: 88, tFinal: 87,
        comm: 86, prod: 83, listen: 87, obj: 81, ctrl: 84,
        notes: 'Engaging cadence style, effective qualification.',
        recs: ['Continue shadowing senior AEs on second-round calls']
      },
      {
        name: 'Lars Lindqvist',
        email: 'lars.l@company.com',
        role: 'Account Executive',
        rp1: 80, rp2: 74, rp3: 79, rp4: 77, rp5: 78,
        tBase: 68, t1: 83, t2: 81, t3: 85, tFinal: 84,
        comm: 81, prod: 80, listen: 80, obj: 75, ctrl: 79,
        notes: 'Steady improvement across all 5 roleplays.',
        recs: ['Sharpen closing call-to-actions']
      },
      {
        name: 'Zuri Mensah',
        email: 'zuri.m@company.com',
        role: 'Customer Success',
        rp1: 83, rp2: 78, rp3: 81, rp4: 90, rp5: 79,
        tBase: 69, t1: 86, t2: 83, t3: 87, tFinal: 86,
        comm: 87, prod: 83, listen: 89, obj: 79, ctrl: 84,
        notes: 'Great at understanding onboarding friction and client sentiment.',
        recs: ['Add structured quarterly business review frameworks']
      }
    ]
  ),

  // Sheet 5: Cohort 5 - Epsilon Horizon
  buildCohort(
    5,
    'Cohort 5 - Epsilon Horizon',
    'C5',
    'Cohort 5',
    'Sarah Jenkins',
    '2026-06-15',
    '2026-07-17',
    [
      {
        name: 'Oliver Thorne',
        email: 'oliver.t@company.com',
        role: 'Account Executive',
        rp1: 89, rp2: 86, rp3: 90, rp4: 88, rp5: 91,
        tBase: 75, t1: 91, t2: 89, t3: 93, tFinal: 92,
        comm: 91, prod: 89, listen: 89, obj: 88, ctrl: 91,
        notes: 'Mastered the revised objection handling methodology. Smooth value bridging.',
        recs: ['Ready for high-ARR quota allocation']
      },
      {
        name: 'Isabella Rossi',
        email: 'isabella.r@company.com',
        role: 'Enterprise SDR',
        rp1: 92, rp2: 88, rp3: 89, rp4: 91, rp5: 87,
        tBase: 78, t1: 94, t2: 91, t3: 94, tFinal: 93,
        comm: 93, prod: 90, listen: 95, obj: 89, ctrl: 90,
        notes: 'Sensational rapport builder. Prospects actively share budget and decision authority.',
        recs: ['Appoint as SDR team lead captain']
      },
      {
        name: 'Brendan Kelly',
        email: 'brendan.k@company.com',
        role: 'Sales Engineer',
        rp1: 84, rp2: 80, rp3: 92, rp4: 83, rp5: 84,
        tBase: 81, t1: 96, t2: 93, t3: 95, tFinal: 96,
        comm: 85, prod: 97, listen: 84, obj: 82, ctrl: 86,
        notes: 'Excellent architecture walkthroughs with engaging storytelling.',
        recs: ['Lead technical workshop for new product release']
      },
      {
        name: 'Camila Fernandez',
        email: 'camila.f@company.com',
        role: 'Customer Success',
        rp1: 88, rp2: 84, rp3: 86, rp4: 96, rp5: 85,
        tBase: 74, t1: 90, t2: 88, t3: 91, tFinal: 90,
        comm: 93, prod: 88, listen: 94, obj: 86, ctrl: 90,
        notes: 'Best de-escalation score in the program history. Rebuilt client confidence in 10 mins.',
        recs: ['Record simulation as standard training baseline']
      },
      {
        name: 'Tariq Mansour',
        email: 'tariq.m@company.com',
        role: 'Account Executive',
        rp1: 82, rp2: 78, rp3: 83, rp4: 80, rp5: 81,
        tBase: 70, t1: 86, t2: 84, t3: 87, tFinal: 86,
        comm: 84, prod: 83, listen: 83, obj: 79, ctrl: 82,
        notes: 'Consistent, confident tone; good handling of competitor questions.',
        recs: ['Refine executive summary email templates']
      },
      {
        name: 'Leila Chen',
        email: 'leila.c@company.com',
        role: 'Commercial SDR',
        rp1: 87, rp2: 82, rp3: 85, rp4: 86, rp5: 83,
        tBase: 73, t1: 89, t2: 86, t3: 90, tFinal: 89,
        comm: 88, prod: 86, listen: 88, obj: 83, ctrl: 86,
        notes: 'High conversion from opening objection to qualified appointment.',
        recs: ['Expand into multi-product cross-sell scripts']
      },
      {
        name: 'Erik Johansson',
        email: 'erik.j@company.com',
        role: 'Account Executive',
        rp1: 83, rp2: 79, rp3: 82, rp4: 81, rp5: 82,
        tBase: 71, t1: 87, t2: 85, t3: 88, tFinal: 87,
        comm: 84, prod: 84, listen: 82, obj: 80, ctrl: 83,
        notes: 'Steady and methodical deal progression.',
        recs: ['Practice urgency creation tactics']
      },
      {
        name: 'Maya Patel',
        email: 'maya.p@company.com',
        role: 'Sales Engineer',
        rp1: 86, rp2: 81, rp3: 91, rp4: 84, rp5: 85,
        tBase: 79, t1: 94, t2: 91, t3: 93, tFinal: 94,
        comm: 86, prod: 95, listen: 85, obj: 83, ctrl: 87,
        notes: 'Translates deep security infrastructure specs into business risk mitigation.',
        recs: ['Ready for enterprise customer meetings']
      }
    ]
  ),

  // Sheet 6: Cohort 6 - Zeta Elite (Latest Cohort)
  buildCohort(
    6,
    'Cohort 6 - Zeta Elite',
    'C6',
    'Cohort 6',
    'Marcus Vance & Elena Rostova',
    '2026-08-03',
    '2026-09-04',
    [
      {
        name: 'Alexander Wright',
        email: 'alexander.w@company.com',
        role: 'Account Executive',
        rp1: 94, rp2: 90, rp3: 93, rp4: 92, rp5: 95,
        tBase: 80, t1: 96, t2: 94, t3: 97, tFinal: 96,
        comm: 95, prod: 94, listen: 94, obj: 92, ctrl: 95,
        notes: 'Highest overall scorecard in all 6 cohorts. Flawless qualification and closing.',
        recs: ['Appoint as benchmark reference presenter', 'Fast track to Enterprise Strategic Tier']
      },
      {
        name: 'Soraya Haddad',
        email: 'soraya.h@company.com',
        role: 'Enterprise SDR',
        rp1: 95, rp2: 91, rp3: 92, rp4: 93, rp5: 89,
        tBase: 82, t1: 97, t2: 93, t3: 96, tFinal: 95,
        comm: 96, prod: 93, listen: 97, obj: 91, ctrl: 94,
        notes: 'Incredible poise, active listening score 97%. Probes with deep strategic empathy.',
        recs: ['Keynote speaker for onboarding cohort 7']
      },
      {
        name: 'Liam Zhang',
        email: 'liam.z@company.com',
        role: 'Sales Engineer',
        rp1: 88, rp2: 84, rp3: 96, rp4: 88, rp5: 89,
        tBase: 84, t1: 99, t2: 96, t3: 98, tFinal: 98,
        comm: 90, prod: 99, listen: 89, obj: 86, ctrl: 91,
        notes: 'Exceptional technical mastery paired with newly honed sales storytelling skills.',
        recs: ['Assign to tier 1 strategic prospects']
      },
      {
        name: 'Gabriela Santos',
        email: 'gabriela.s@company.com',
        role: 'Customer Success',
        rp1: 91, rp2: 87, rp3: 89, rp4: 98, rp5: 88,
        tBase: 78, t1: 93, t2: 91, t3: 94, tFinal: 93,
        comm: 95, prod: 91, listen: 96, obj: 89, ctrl: 93,
        notes: 'Mastered executive crisis navigation. Highest de-escalation score recorded (98%).',
        recs: ['Create de-escalation masterclass video for global CS org']
      },
      {
        name: 'Darius Cole',
        email: 'darius.c@company.com',
        role: 'Account Executive',
        rp1: 88, rp2: 84, rp3: 87, rp4: 86, rp5: 89,
        tBase: 75, t1: 91, t2: 88, t3: 92, tFinal: 91,
        comm: 89, prod: 89, listen: 88, obj: 86, ctrl: 89,
        notes: 'Great commercial intuition. Anchors pricing strongly on value metrics.',
        recs: ['Shadow senior enterprise negotiations']
      },
      {
        name: 'Chloe Kim',
        email: 'chloe.k@company.com',
        role: 'Commercial SDR',
        rp1: 90, rp2: 86, rp3: 88, rp4: 89, rp5: 86,
        tBase: 76, t1: 92, t2: 89, t3: 93, tFinal: 91,
        comm: 91, prod: 89, listen: 92, obj: 87, ctrl: 89,
        notes: 'High energy, crisp objection reframing, high meeting-booking velocity.',
        recs: ['Test novel account-based marketing sequencing']
      },
      {
        name: 'Nathalie Dupont',
        email: 'nathalie.d@company.com',
        role: 'Technical Consultant',
        rp1: 87, rp2: 82, rp3: 93, rp4: 86, rp5: 86,
        tBase: 81, t1: 95, t2: 92, t3: 95, tFinal: 94,
        comm: 88, prod: 96, listen: 87, obj: 84, ctrl: 88,
        notes: 'Very articulate on data migration architectures and security governance.',
        recs: ['Deliver cloud architecture brownbag session']
      },
      {
        name: 'Ethan Brooks',
        email: 'ethan.b@company.com',
        role: 'Account Executive',
        rp1: 86, rp2: 82, rp3: 86, rp4: 85, rp5: 87,
        tBase: 74, t1: 90, t2: 87, t3: 91, tFinal: 90,
        comm: 88, prod: 87, listen: 87, obj: 84, ctrl: 87,
        notes: 'Solid closing discipline and strong executive presence.',
        recs: ['Ready for live territory deployment']
      }
    ]
  )
];
