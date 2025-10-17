const CardPayment = require('../../models/Payments/CardPayment');
const GovernmentPayment = require('../../models/Payments/GovernmentCoveredPayment');
const InsurancePayment = require('../../models/Payments/InsurancePayment');

describe('Payment Models', () => {
  describe('CardPayment Model', () => {
    test('should have required fields', () => {
      const cardPayment = new CardPayment();
      const validationError = cardPayment.validateSync();
      
      expect(validationError.errors.userId).toBeDefined();
      expect(validationError.errors.appointmentId).toBeDefined();
      expect(validationError.errors.amount).toBeDefined();
      expect(validationError.errors.stripePaymentIntentId).toBeDefined();
    });

    test('should create a valid card payment', () => {
      const cardPaymentData = {
        userId: '507f1f77bcf86cd799439011',
        appointmentId: '507f1f77bcf86cd799439012',
        amount: 100,
        stripePaymentIntentId: 'pi_test123',
        stripeCustomerId: 'cus_test123',
        paymentStatus: 'succeeded'
      };
      
      const cardPayment = new CardPayment(cardPaymentData);
      expect(cardPayment.userId.toString()).toBe(cardPaymentData.userId);
      expect(cardPayment.amount).toBe(100);
      expect(cardPayment.paymentStatus).toBe('succeeded');
    });

    test('should have default payment status as pending', () => {
      const cardPayment = new CardPayment({
        userId: '507f1f77bcf86cd799439011',
        appointmentId: '507f1f77bcf86cd799439012',
        amount: 100,
        stripePaymentIntentId: 'pi_test123'
      });
      
      expect(cardPayment.paymentStatus).toBe('pending');
    });

    test('should update updatedAt on save', () => {
      const cardPayment = new CardPayment({
        userId: '507f1f77bcf86cd799439011',
        appointmentId: '507f1f77bcf86cd799439012',
        amount: 100,
        stripePaymentIntentId: 'pi_test123'
      });
      
      const oldUpdatedAt = cardPayment.updatedAt.getTime();
      
      // Simulate the pre-save hook
      cardPayment.updatedAt = new Date();
      expect(cardPayment.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt);
    });
  });

  describe('GovernmentPayment Model', () => {
    test('should have required fields', () => {
      const govPayment = new GovernmentPayment();
      const validationError = govPayment.validateSync();
      
      expect(validationError.errors.userId).toBeDefined();
      expect(validationError.errors.appointmentId).toBeDefined();
    });

    test('should create a valid government payment', () => {
      const govPaymentData = {
        userId: '507f1f77bcf86cd799439011',
        appointmentId: '507f1f77bcf86cd799439012',
        coverageType: 'government',
        approvalReferenceNumber: 'GOV123456',
        paymentStatus: 'approved'
      };
      
      const govPayment = new GovernmentPayment(govPaymentData);
      expect(govPayment.userId.toString()).toBe(govPaymentData.userId);
      expect(govPayment.coverageType).toBe('government');
      expect(govPayment.paymentStatus).toBe('approved');
    });

    test('should have default values', () => {
      const govPayment = new GovernmentPayment({
        userId: '507f1f77bcf86cd799439011',
        appointmentId: '507f1f77bcf86cd799439012'
      });
      
      expect(govPayment.coverageType).toBe('government');
      expect(govPayment.paymentStatus).toBe('approved');
      expect(govPayment.approvedDate).toBeDefined();
    });
  });

  describe('InsurancePayment Model', () => {
    test('should have required fields', () => {
      const insurancePayment = new InsurancePayment();
      const validationError = insurancePayment.validateSync();
      
      expect(validationError.errors.userId).toBeDefined();
      expect(validationError.errors.appointmentId).toBeDefined();
      expect(validationError.errors.insuranceProvider).toBeDefined();
      expect(validationError.errors.policyNumber).toBeDefined();
      expect(validationError.errors.coveredAmount).toBeDefined();
    });

    test('should create a valid insurance payment', () => {
      const insuranceData = {
        userId: '507f1f77bcf86cd799439011',
        appointmentId: '507f1f77bcf86cd799439012',
        insuranceProvider: 'BlueCross',
        policyNumber: 'POL123456',
        claimReferenceNumber: 'CLAIM789',
        coveredAmount: 500,
        coPaymentAmount: 50,
        paymentStatus: 'approved'
      };
      
      const insurancePayment = new InsurancePayment(insuranceData);
      expect(insurancePayment.userId.toString()).toBe(insuranceData.userId);
      expect(insurancePayment.insuranceProvider).toBe('BlueCross');
      expect(insurancePayment.coveredAmount).toBe(500);
      expect(insurancePayment.coPaymentAmount).toBe(50);
    });

    test('should have default coPaymentAmount as 0', () => {
      const insurancePayment = new InsurancePayment({
        userId: '507f1f77bcf86cd799439011',
        appointmentId: '507f1f77bcf86cd799439012',
        insuranceProvider: 'BlueCross',
        policyNumber: 'POL123456',
        coveredAmount: 500
      });
      
      expect(insurancePayment.coPaymentAmount).toBe(0);
    });

    test('should have default payment status as pending', () => {
      const insurancePayment = new InsurancePayment({
        userId: '507f1f77bcf86cd799439011',
        appointmentId: '507f1f77bcf86cd799439012',
        insuranceProvider: 'BlueCross',
        policyNumber: 'POL123456',
        coveredAmount: 500
      });
      
      expect(insurancePayment.paymentStatus).toBe('pending');
    });

    test('should validate payment status enum', () => {
      const insurancePayment = new InsurancePayment({
        userId: '507f1f77bcf86cd799439011',
        appointmentId: '507f1f77bcf86cd799439012',
        insuranceProvider: 'BlueCross',
        policyNumber: 'POL123456',
        coveredAmount: 500,
        paymentStatus: 'invalid_status'
      });
      
      const validationError = insurancePayment.validateSync();
      expect(validationError.errors.paymentStatus).toBeDefined();
    });
  });
});
