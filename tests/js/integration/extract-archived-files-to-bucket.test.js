const fs = require('fs');
const getS3Client = require(process.env.AIRFLOW_HOME + '/dags/js/aws/get-s3-client');
const extractArchivedFilesToBucket = require(process.env.AIRFLOW_HOME + '/dags/js/tasks/extract-archived-files-to-bucket');

let unlinkSyncOriginal = fs.unlinkSync;


describe('Test extractArchivedFilesToBucket', () => {

  beforeEach(() => {
    process.env = {
      AIRFLOW_CTX_DAG_ID: 'dag_1',
      AIRFLOW_CTX_TASK_ID: 'task_1',
      AIRFLOW_CTX_DAG_RUN_ID: 'dag_run_1',
      AIRFLOW_CTX_EXECUTION_DATE: new Date(2019, 1, 1).toISOString(),
      COMPLETED_TASKS_BUCKET: 'dev-jats-ingester-completed-tasks',
      ENDPOINT_URL: 'http://s3:9000',
      SOURCE_BUCKET: 'dev-jats-ingester-incoming'
    };

    fs.unlinkSync = unlinkSyncOriginal;
  });

  test('using elife-00666-vor-r1.zip', async () => {

    let destinationBucket = 'dev-jats-ingester-extract-archive-00666';

    process.env.DESTINATION_BUCKET = destinationBucket;
    process.env.ARCHIVE_FILE_NAME = 'elife-00666-vor-r1.zip';
    fs.unlinkSync = jest.fn();

    let s3 = getS3Client();

    s3.createBucket({Bucket: destinationBucket}, (error) => {
      if (error) {
        throw error;
      }
    });


    await extractArchivedFilesToBucket();

    let s3Params = {Bucket: destinationBucket, Prefix: 'elife-00666-vor-r1'};
    let response = await s3.listObjectsV2(s3Params, (error) => {
      if (error) {
        throw error;
      }
    }).promise();

    expect(response.Contents[0].Key).toBe('elife-00666-vor-r1/elife-00666.xml');
    expect(response.Contents[1].Key).toBe('elife-00666-vor-r1/fig1-v1.jpg');
    expect(fs.unlinkSync).toHaveBeenCalledTimes(1);
  });

  test('using biorxiv-685172.meca', async () => {

    let destinationBucket = 'dev-jats-ingester-extract-archive-685172';

    process.env.DESTINATION_BUCKET = destinationBucket;
    process.env.ARCHIVE_FILE_NAME = 'biorxiv-685172.meca';
    fs.unlinkSync = jest.fn();

    let s3 = getS3Client();

    s3.createBucket({Bucket: destinationBucket}, (error) => {
      if (error) {
        throw error;
      }
    });

    await extractArchivedFilesToBucket();

    let s3Params = {Bucket: destinationBucket, Prefix: 'biorxiv-685172'};
    let response = await s3.listObjectsV2(s3Params, (error) => {
      if (error) {
        throw error;
      }
    }).promise();

    expect(response.Contents[0].Key).toBe('biorxiv-685172/content/685172.pdf');
    expect(response.Contents[1].Key).toBe('biorxiv-685172/content/685172.xml');
    expect(response.Contents[2].Key).toBe('biorxiv-685172/content/685172v1_fig1.tif');
    expect(fs.unlinkSync).toHaveBeenCalledTimes(1);
  });

});