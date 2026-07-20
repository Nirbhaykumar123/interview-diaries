-- CreateIndex
CREATE INDEX "comments_interview_id_parent_id_idx" ON "comments"("interview_id", "parent_id");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");
