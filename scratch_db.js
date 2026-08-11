import pool from './services/db.js';

async function run() {
    try {
        const createViewSql = `
            CREATE OR REPLACE VIEW teacher_lesson_performance AS
            SELECT 
                sec.teacher_id,
                subj.subject_name,
                l.quarter,
                l.lesson_number,
                COALESCE(AVG(pts.grade), 0) AS avg_grade
            FROM sections sec
            JOIN subjects_in_section sis ON sec.section_id = sis.section_belong
            JOIN subjects subj ON sis.subject_id = subj.subject_id
            JOIN lessons l ON subj.subject_id = l.subject_belong
            LEFT JOIN subject_contents sc ON l.lesson_id = sc.lesson_belong
            LEFT JOIN tests t ON sc.content_id = t.content_id
            LEFT JOIN pupil_test_scores pts ON t.test_id = pts.test_id
            LEFT JOIN enroll_me e ON pts.pupil_id = e.pupil_id AND e.section_id = sec.section_id
            GROUP BY sec.teacher_id, subj.subject_name, l.quarter, l.lesson_number;
        `;
        await pool.query(createViewSql);
        console.log("View created successfully.");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
