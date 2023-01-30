import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1674120494591 implements MigrationInterface {
  name = 'migration1674120494591';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "sessions" (
                "id" character varying NOT NULL,
                "userId" character varying NOT NULL,
                "isClosed" boolean NOT NULL,
                "createdAt" integer NOT NULL,
                "updatedAt" integer NOT NULL,
                CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_3238ef96f18b355b671619111b" ON "sessions" ("id")
        `);
    await queryRunner.query(`
            CREATE TABLE "tokens" (
                "id" character varying NOT NULL,
                "sessionId" character varying NOT NULL,
                "isClosed" boolean NOT NULL,
                "createdAt" integer NOT NULL,
                "updatedAt" integer NOT NULL,
                CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_3001e89ada36263dabf1fb6210" ON "tokens" ("id")
        `);
    await queryRunner.query(`
            ALTER TABLE "tokens"
            ADD CONSTRAINT "FK_d72285f7398744921a81553f843" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tokens" DROP CONSTRAINT "FK_d72285f7398744921a81553f843"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_3001e89ada36263dabf1fb6210"
        `);
    await queryRunner.query(`
            DROP TABLE "tokens"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_3238ef96f18b355b671619111b"
        `);
    await queryRunner.query(`
            DROP TABLE "sessions"
        `);
  }
}
