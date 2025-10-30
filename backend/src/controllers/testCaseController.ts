import { Request, Response } from 'express';
import pool from '../config/database';
import { TestCase, TestFile } from '../../../shared/types';
import { testDiscoveryService } from '../services/testDiscoveryService';
import { testExecutionService } from '../services/testExecutionService';

export const getAllTestCases = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { type, status, search } = req.query;

    let query = `
      SELECT tc.*, tf.name as file_name
      FROM test_cases tc
      LEFT JOIN test_files tf ON tc.test_file_id = tf.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (type) {
      query += ` AND tc.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (status) {
      query += ` AND tc.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (search) {
      query += ` AND (tc.name ILIKE $${paramCount} OR tc.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY tc.created_at DESC';

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get test cases error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const getTestCaseById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM test_cases WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Test case not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get test case error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const createTestCase = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, type, filePath, suite, testFileId } = req.body;

    if (!name || !type || !filePath || !suite) {
      res.status(400).json({
        success: false,
        error: 'Name, type, file path, and suite are required',
      });
      return;
    }

    const result = await pool.query(
      `INSERT INTO test_cases (name, description, type, file_path, suite, test_file_id, status, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, description || '', type, filePath, suite, testFileId || null, 'pending', true]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Test case created successfully',
    });
  } catch (error) {
    console.error('Create test case error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const updateTestCase = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, type, filePath, suite, status, active } = req.body;

    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      params.push(name);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      params.push(description);
      paramCount++;
    }

    if (type !== undefined) {
      updates.push(`type = $${paramCount}`);
      params.push(type);
      paramCount++;
    }

    if (filePath !== undefined) {
      updates.push(`file_path = $${paramCount}`);
      params.push(filePath);
      paramCount++;
    }

    if (suite !== undefined) {
      updates.push(`suite = $${paramCount}`);
      params.push(suite);
      paramCount++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (active !== undefined) {
      updates.push(`active = $${paramCount}`);
      params.push(active);
      paramCount++;
    }

    if (updates.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
      return;
    }

    params.push(id);
    const query = `
      UPDATE test_cases
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Test case not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Test case updated successfully',
    });
  } catch (error) {
    console.error('Update test case error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const deleteTestCase = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM test_cases WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Test case not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Test case deleted successfully',
    });
  } catch (error) {
    console.error('Delete test case error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const getAllTestFiles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { type, status } = req.query;

    let query = 'SELECT * FROM test_files WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (type) {
      query += ` AND type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ' ORDER BY modified_at DESC';

    const filesResult = await pool.query(query, params);

    // Get test cases for each file
    const filesWithCases = await Promise.all(
      filesResult.rows.map(async (file: any) => {
        const casesResult = await pool.query(
          'SELECT * FROM test_cases WHERE test_file_id = $1 ORDER BY created_at',
          [file.id]
        );

        return {
          ...file,
          testCases: casesResult.rows,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: filesWithCases,
    });
  } catch (error) {
    console.error('Get test files error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const discoverTests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await testDiscoveryService.discoverAndRegisterAllTests();

    res.status(200).json({
      success: true,
      data: {
        discovered: result.count,
        tests: result.tests,
      },
      message: `Successfully discovered and registered ${result.count} test file(s)`,
    });
  } catch (error) {
    console.error('Test discovery error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to discover tests',
    });
  }
};

export const executeTestFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Start test execution asynchronously
    testExecutionService.executeTestFile(id).catch((error) => {
      console.error('Test execution error:', error);
    });

    res.status(200).json({
      success: true,
      message: 'Test execution started',
    });
  } catch (error) {
    console.error('Execute test file error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start test execution',
    });
  }
};

export const cleanupTestFiles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Delete all test cases first (foreign key constraint)
    await pool.query('DELETE FROM test_cases');
    
    // Delete all test files
    await pool.query('DELETE FROM test_files');

    res.status(200).json({
      success: true,
      message: 'All test files and cases have been removed. Click "Discover Tests" to re-scan.',
    });
  } catch (error) {
    console.error('Cleanup test files error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup test files',
    });
  }
};
