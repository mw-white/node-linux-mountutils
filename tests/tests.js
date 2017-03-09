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

  var paths = [ '/tmp/testmount',
                '/tmp/a (scary) m"ount',
                "/tmp/n0!$#;`~`'"
              ];
  for (var p in paths) {
    describe('mount - bind /var/tmp to ' + paths[p], function() {
      var result;

      before(function(done) {
        mountutil.mount("/var/tmp",paths[p], { "fsopts": "bind","createDir":true }, function(ret) {
          result = ret;
          done();
        });
      });

      it('result should be OK', function() {
        result.OK.should.be.true;
      });
      it('isMounted should show ' + paths[p] + ' is mounted', function() {
        var result = mountutil.isMounted(paths[p],false);
        result.mounted.should.be.true;
      });
    });

    describe('umount - unmount ' + paths[p], function() {
      var result;

      before(function(done) {
        mountutil.umount(paths[p], false, { "removeDir":true }, function(ret) {
          result = ret;
          done();
        });
      });

      it('result should be OK', function() {
        result.OK.should.be.true;
      });
      it('isMounted should show ' + paths[p] + ' is not mounted', function() {
        var result = mountutil.isMounted("/tmp/testmount",false);
        result.mounted.should.be.false;
      });
    });
  }
});
