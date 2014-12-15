// Sample usage
//
// This example uses the isMounted() function to test if anything is 
// mounted at /tmp/testmount.  If something is mounted there, it unmounts
// it; otherwise it does a simple bind mount of the "/var/tmp" folder to 
// that mountpoint.
//
// The effect is basically each time you run this, it will mount or unmount
// /var/tmp from /tmp/testmount.  It is set to create /tmp/testmount if
// needed and delete it after unmounting.
//
// Note: If you delete stuff from inside /tmp/testmount after the mount, it
// will be deleted from /var/tmp!
//

var mountutil = require("../mountutils");

var myMountPoint = "/tmp/testmount";
var myMountDev = "/var/tmp";

// Let's see if it's already mounted
var ret = mountutil.isMounted(myMountPoint,false);
console.log("isMounted(): " + JSON.stringify(ret, null, "  "));

if (!ret.mounted) {
  // It's not mounted - let's mount it!
  mountutil.mount(myMountDev,myMountPoint, { "fsopts": "bind","createDir":true }, function(result) {
    if (result.error) {
      // Something went wrong
      console.log("There was an error mounting: " + result.error);
    } else {
      // It worked - let's see what isMounted says now
      console.log("Mount OK");
      var after = mountutil.isMounted(myMountPoint,false);
      console.log("isMounted(): " + JSON.stringify(after,null,"  "));
    }
  });
} else {
  // It's mounted.  Let's get rid of it!
  mountutil.umount(myMountPoint, false, {"removeDir": true}, function(result) {
    if (result.error) {
      // Something went wrong
      console.log("There was an error mounting: " + result.error);
    } else {
      // It worked - let's see what isMounted says now
      console.log("Umount OK");
      var after = mountutil.isMounted(myMountPoint,false);
      console.log("isMounted(): " + JSON.stringify(after,null,"  "));
    }
  });
}
