var should = require('should');
var mountutil = require('../mountutils');

describe('linux-mountutils', function() {
  describe('isMounted', function() {
    it('returns an object with mounted: true for a known mount', function() {
      var result = mountutil.isMounted("/",false);
      result.mounted.should.be.true;
    });
    it('returns an object with mounted: false for a (hopefully) nonexistent mount', function() {
      var result = mountutil.isMounted("/thismountprobablydoesntexist",false);
      result.mounted.should.be.false;
    });
  });

  describe('mount - bind /var/tmp to /tmp/testmount', function() {
    var result;

    before(function(done) {
      mountutil.mount("/var/tmp","/tmp/testmount", { "fsopts": "bind","createDir":true }, function(ret) {
        result = ret;
        done();
      });
    });

    it('result should be OK', function() {
      result.OK.should.be.true;
    });
    it('isMounted should show /tmp/testmount is mounted', function() {
      var result = mountutil.isMounted("/tmp/testmount",false);
      result.mounted.should.be.true;
    });
  });

  describe('umount - unmount /tmp/testmount', function() {
    var result;

    before(function(done) {
      mountutil.umount("/tmp/testmount", false, { "removeDir":true }, function(ret) {
        result = ret;
        done();
      });
    });

    it('result should be OK', function() {
      result.OK.should.be.true;
    });
    it('isMounted should show /tmp/testmount is not mounted', function() {
      var result = mountutil.isMounted("/tmp/testmount",false);
      result.mounted.should.be.false;
    });
  });
});
