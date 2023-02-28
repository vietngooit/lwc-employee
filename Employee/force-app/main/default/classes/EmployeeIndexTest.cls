@IsTest(SeeAllData=false)
public class EmployeeIndexTest {
    @IsTest static void ok() {
        String name = 'test account 1';
        String email = 'test email 1';
        String phone = 'test phone 1';
        String memo = 'test memo 1';

        Test.startTest();
        Emp__c e = EmployeeIndex.newEmployee(name, email, phone, date.parse('2023-02-22'), memo);
        System.debug(e);
        Test.stopTest();
        
        List<Emp__c> le = [Select Id, Name__c from Emp__c where Id = :e.Id];
        System.assertEquals(name, le[0].Name__c, 'ok');
    }
    @isTest static void hi() {
        List<Emp__c> employees = new List<Emp__c>();

        String name = 'test account 1';
        System.debug(name);
        String email = 'test email 1';
        String phone = 'test phone 1';
        String memo = 'test memo 1';

        Emp__c e = new Emp__c();
        e.Name__c = 'Name 1';
        e.Phone__c = 'Phone 1';
        e.Email__c = 'Email@gmail.com';
        e.BirthDay__c = date.parse('12/27/2015');
        insert e;
        Test.startTest();
        employees = EmployeeIndex.getDataEmployees();
        Test.stopTest();
        System.assertEquals(1, employees.size(), 'ok');
    
    }
}