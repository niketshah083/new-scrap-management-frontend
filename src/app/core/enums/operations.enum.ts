export enum OperationCode {
  // Standard CRUD operations - using PascalCase to match backend permission codes
  Create = 'Create',
  Read = 'Read',
  Update = 'Update',
  Delete = 'Delete',
  List = 'List',
  Export = 'Export',
  Import = 'Import',
  Approve = 'Approve',
  Edit = 'Edit',
  Verify = 'Verify',

  // GRN Step-wise operations
  STEP1_GATE_ENTRY = 'STEP1_GATE_ENTRY',
  STEP2_INITIAL_WEIGHING = 'STEP2_INITIAL_WEIGHING',
  STEP3_UNLOADING = 'STEP3_UNLOADING',
  STEP4_FINAL_WEIGHING = 'STEP4_FINAL_WEIGHING',
  STEP5_SUPERVISOR_REVIEW = 'STEP5_SUPERVISOR_REVIEW',
  STEP6_QC_INSPECTION = 'STEP6_QC_INSPECTION',
  STEP7_GATE_PASS = 'STEP7_GATE_PASS',
}

export const OperationDefinitions: Record<OperationCode, { name: string }> = {
  // Standard CRUD operations
  [OperationCode.Create]: { name: 'Create' },
  [OperationCode.Read]: { name: 'Read' },
  [OperationCode.Update]: { name: 'Update' },
  [OperationCode.Delete]: { name: 'Delete' },
  [OperationCode.List]: { name: 'List' },
  [OperationCode.Export]: { name: 'Export' },
  [OperationCode.Import]: { name: 'Import' },
  [OperationCode.Approve]: { name: 'Approve' },
  [OperationCode.Edit]: { name: 'Edit' },
  [OperationCode.Verify]: { name: 'Verify' },

  // GRN Step-wise operations
  [OperationCode.STEP1_GATE_ENTRY]: { name: 'Step 1 - Gate Entry' },
  [OperationCode.STEP2_INITIAL_WEIGHING]: { name: 'Step 2 - Initial Weighing' },
  [OperationCode.STEP3_UNLOADING]: { name: 'Step 3 - Unloading' },
  [OperationCode.STEP4_FINAL_WEIGHING]: { name: 'Step 4 - Final Weighing' },
  [OperationCode.STEP5_SUPERVISOR_REVIEW]: { name: 'Step 5 - Supervisor Review' },
  [OperationCode.STEP6_QC_INSPECTION]: { name: 'Step 6 - QC Inspection' },
  [OperationCode.STEP7_GATE_PASS]: { name: 'Step 7 - Gate Pass' },
};

// Helper to get step operation code by step number
export const getStepOperationCode = (step: number): OperationCode | null => {
  const stepMap: Record<number, OperationCode> = {
    1: OperationCode.STEP1_GATE_ENTRY,
    2: OperationCode.STEP2_INITIAL_WEIGHING,
    3: OperationCode.STEP3_UNLOADING,
    4: OperationCode.STEP4_FINAL_WEIGHING,
    5: OperationCode.STEP5_SUPERVISOR_REVIEW,
    6: OperationCode.STEP6_QC_INSPECTION,
    7: OperationCode.STEP7_GATE_PASS,
  };
  return stepMap[step] || null;
};

// GRN step operations array for filtering
export const GRN_STEP_OPERATIONS = [
  OperationCode.STEP1_GATE_ENTRY,
  OperationCode.STEP2_INITIAL_WEIGHING,
  OperationCode.STEP3_UNLOADING,
  OperationCode.STEP4_FINAL_WEIGHING,
  OperationCode.STEP5_SUPERVISOR_REVIEW,
  OperationCode.STEP6_QC_INSPECTION,
  OperationCode.STEP7_GATE_PASS,
];

// Standard operations array (non-step operations)
export const STANDARD_OPERATIONS = [
  OperationCode.Create,
  OperationCode.Read,
  OperationCode.Update,
  OperationCode.Delete,
  OperationCode.List,
  OperationCode.Export,
  OperationCode.Import,
  OperationCode.Approve,
  OperationCode.Edit,
  OperationCode.Verify,
];
